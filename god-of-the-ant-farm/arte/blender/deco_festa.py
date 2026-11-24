# deco_festa: what a tavern shows of the fourth wave (the front T7, D-880 to D-889 — planos/taverna-onda4.md): the feast's decorations
# by what each is made of (the garlands of the flowers of the wild or of the garden, the bunting and the drapes of a people that
# weaves, the standards in the people's colours with its emblem, the petals on the tables), the feast's platter of each people (its
# parts what its recipe spent), the bar across the locked door and the door broken in (its leaf fallen, the splinters), the dice and
# their cup, the painted tablets of a game of cards and their deck. On the shapes of moveis_forma.py and the colours of each point of
# deco_comida.py (imported first: its hook colours every point).
# The parts that come and go: x-<parte> — a part of the feast's platter, there only where the recipe spent that part of the food
# (js/dentro3d.js: b.festa.prato). The rest always; the game paints each by the people and what it has.
import math, random
from mathutils import Vector, Matrix
import deco_comida as DC
from deco_comida import cor, mix, mul, manchas, grao, hsh, disco, prato_fundo, R
from moveis_forma import torno, cilindro, tubo, curva, arco_pts, lamina, ovo, almofada, caixa, TAU

# (the flowers of a garland, of the petals: the colours of the wild and of a garden's beds — each flower its own by its place)
FLORES = [(214, 52, 48), (236, 196, 52), (244, 240, 230), (196, 92, 168), (92, 112, 200), (236, 132, 44)]
def flor(p): return FLORES[int(hsh(round(p[0] * 60), round(p[1] * 60), round(p[2] * 60)) * len(FLORES)) % len(FLORES)]

def _caten(w, sag, n):
    """the points of a cord hung between two nails w apart, sagging sag at its middle (a parabola), in the wall's plane"""
    return [(-w / 2 + w * k / (n - 1), -sag * (1 - (2 * k / (n - 1) - 1) ** 2), 0.0) for k in range(n)]

def guirlanda(tipo):
    """a swag of greenery hung on the wall from two nails: the leaves of the wild with its flowers (flores), or the garden's greens
    with its garlic and its herbs (horta)"""
    def f(M, w, d, h):
        rnd = R(5 if tipo == 'flores' else 7); top = h - 0.03; sag = h * 0.6; zc = -d / 2 + 0.045
        pts = [(x, top + y, zc) for x, y, z in _caten(w - 0.06, sag, 11 if M.lod == 0 else 7)]
        tubo(M, 'corda', pts, 0.006, seg=5)
        for s in (-1, 1): cilindro(M, 'ferro', s * (w / 2 - 0.03), top - 0.004, -d / 2 + 0.006, 0.004, 0.008, seg=5)
        n = 46 if M.lod == 0 else 18
        for k in range(n):
            t = k / (n - 1); x = -w / 2 + 0.07 + (w - 0.14) * t; y = top - sag * (1 - (2 * t - 1) ** 2) * 0.97; a = rnd.uniform(0, TAU)
            ox, oy, oz = 0.02 * math.cos(a), 0.022 * math.sin(a) - 0.01, zc + rnd.uniform(-0.01, 0.02)
            ovo(M, 'erva', x + ox, y + oy, oz, 0.03, 0.012, 0.02, seg=4, nv=2)
            if tipo == 'flores' and k % 2 == 0:
                fx, fy = x - ox * 0.5, y - oy * 0.4
                with cor(lambda p, fx=fx, fy=fy: (236, 200, 60) if math.hypot(p[0] - fx, p[1] - fy) < 0.005 else flor((fx, fy, 0.0))): ovo(M, 'flor', fx, fy, zc + 0.024, 0.016, 0.016, 0.006, seg=6, nv=2)
            elif tipo == 'horta' and k % 3 == 0:
                ovo(M, 'alho', x, y - 0.02, zc + 0.02, 0.012, 0.014, 0.012, seg=6, nv=3)
    return f

def bandeirolas(M, w, d, h):
    # (the bunting: a cord across the wall, small pennants of cloth on it, one colour and the other — the people's cloth)
    top = h - 0.01; sag = 0.08; n = 9 if M.lod == 0 else 7
    pts = [(x, top + y, -d / 2 + 0.01) for x, y, z in _caten(w - 0.04, sag, 9)]
    tubo(M, 'corda', pts, 0.003, seg=4)
    for k in range(n):
        t = (k + 0.5) / n; x = -w / 2 + 0.02 + (w - 0.04) * t; y = top - sag * (1 - (2 * t - 1) ** 2); ww = (w - 0.04) / n * 0.82; hh = h - sag - 0.03
        tw = 0.01 * math.sin(k * 1.7)
        lamina(M, 'pano' if k % 2 else 'pano2', lambda u, v, x=x, y=y, ww=ww, hh=hh, tw=tw: (x + (u - 0.5) * ww * (1 - v), y - hh * v, -d / 2 + 0.012 + tw * v + 0.006 * math.sin(u * 3.1)), 2, 3, both=True)

def pano_festa(M, w, d, h):
    # (a drape in festoons along the wall: the cloth gathered at three points, falling between, its hem of the other colour)
    def f(u, v):
        x = -w / 2 + w * u; dip = 0.32 * h * (1 - math.cos(u * TAU * 2)) / 2; y = h - 0.02 - (h * 0.45 + dip) * v
        return (x, y, -d / 2 + 0.008 + 0.025 * v * (1 - math.cos(u * TAU * 2)) / 2 + 0.01 * math.sin(v * 3))
    lamina(M, 'pano2', f, 16, 4, both=True)
    def hem(u, v):
        x = -w / 2 + w * u; dip = 0.32 * h * (1 - math.cos(u * TAU * 2)) / 2; y = h - 0.02 - (h * 0.45 + dip) - 0.04 * v
        return (x, y, -d / 2 + 0.034 * (1 - math.cos(u * TAU * 2)) / 2 + 0.011)
    lamina(M, 'pano', hem, 16, 1, both=True)
    for x in (-w / 2 + 0.02, 0.0, w / 2 - 0.02): ovo(M, 'pano', x, h - 0.03, -d / 2 + 0.015, 0.025, 0.02, 0.012, seg=6, nv=3)

def _emblema(M, civ, cx, cy, z, s):
    """the people's emblem painted on its standard (the second colour): the winged sun of the Nile, the sun stone of the lake, the
    knot of the north, the laurel of the Romans, the shield of the Greeks, the star of the others"""
    P = 'tinta2'
    def ring(r0, r1, n=24, a0=0.0, a1=TAU):
        lamina(M, P, lambda u, v: (cx + (r0 + (r1 - r0) * v) * math.cos(a0 + (a1 - a0) * u), cy + (r0 + (r1 - r0) * v) * math.sin(a0 + (a1 - a0) * u), z), n, 1, both=True)
    def disc(r, n=20): lamina(M, P, lambda u, v: (cx + r * v * math.cos(u * TAU), cy + r * v * math.sin(u * TAU), z), n, 1, both=True)
    if M.lod: disc(s * 0.36, 12); return  # (from afar: the emblem a disc of its colour)
    if civ == 'egipcio':
        disc(s * 0.32)
        for sg in (-1, 1): lamina(M, P, lambda u, v, sg=sg: (cx + sg * (s * 0.34 + s * 0.62 * u), cy + s * 0.05 - s * 0.16 * u * u + s * 0.16 * v * (1 - 0.6 * u), z), 6, 2, both=True)
    elif civ == 'asteca':
        disc(s * 0.3); ring(s * 0.4, s * 0.48)
        for k in range(8):
            a = k * TAU / 8; lamina(M, P, lambda u, v, a=a: (cx + math.cos(a) * (s * 0.5 + s * 0.38 * v) + math.cos(a + math.pi / 2) * s * 0.08 * (1 - v) * (u - 0.5) * 2, cy + math.sin(a) * (s * 0.5 + s * 0.38 * v) + math.sin(a + math.pi / 2) * s * 0.08 * (1 - v) * (u - 0.5) * 2, z), 1, 1, both=True)
    elif civ == 'nordico':
        for k in range(3):
            a = k * TAU / 3 + 0.5; ox, oy = cx + math.cos(a) * s * 0.22, cy + math.sin(a) * s * 0.22
            lamina(M, P, lambda u, v, ox=ox, oy=oy, a=a: (ox + (s * 0.26 + s * 0.08 * v) * math.cos(a + 1.2 + u * 3.6), oy + (s * 0.26 + s * 0.08 * v) * math.sin(a + 1.2 + u * 3.6), z), 10, 1, both=True)
    elif civ == 'romano':
        for sg in (-1, 1):
            for k in range(7):
                a = -math.pi / 2 + sg * (0.35 + 0.33 * k)
                ex, ey = cx + math.cos(a) * s * 0.55, cy + math.sin(a) * s * 0.55
                lamina(M, P, lambda u, v, ex=ex, ey=ey, a=a: (ex + math.cos(a + math.pi / 2) * s * 0.16 * (u - 0.5) * math.sin(math.pi * v), ey + math.sin(a + math.pi / 2) * s * 0.16 * (u - 0.5) * math.sin(math.pi * v) + s * 0.14 * v, z), 1, 3, both=True)
    elif civ == 'grego':
        ring(s * 0.46, s * 0.56, 28); disc(s * 0.16)
        for k in range(4):
            a = k * TAU / 4 + math.pi / 4; lamina(M, P, lambda u, v, a=a: (cx + math.cos(a) * s * (0.2 + 0.24 * v) + math.cos(a + math.pi / 2) * s * 0.04 * (u - 0.5) * 2, cy + math.sin(a) * s * (0.2 + 0.24 * v) + math.sin(a + math.pi / 2) * s * 0.04 * (u - 0.5) * 2, z), 1, 1, both=True)
    else:
        for k in range(8):
            a = k * TAU / 8 + math.pi / 8; r = s * (0.55 if k % 2 == 0 else 0.3)
            lamina(M, P, lambda u, v, a=a, r=r: (cx + math.cos(a) * r * v + math.cos(a + math.pi / 2) * s * 0.12 * (1 - v) * (u - 0.5) * 2, cy + math.sin(a) * r * v + math.sin(a + math.pi / 2) * s * 0.12 * (1 - v) * (u - 0.5) * 2, z), 1, 1, both=True)
        disc(s * 0.14)

def estandarte(civ):
    """the standard of a people hung on its wall: an arm out of the wall, the crossbar, the banner of the people's colour with its
    border and its emblem of the second colour, its swallowtail and its tassels"""
    def f(M, w, d, h):
        z0 = -d / 2; zb = z0 + d * 0.62
        tubo(M, 'madeira', [(0.0, h - 0.03, z0), (0.0, h - 0.03, zb)], 0.012, seg=6)
        tubo(M, 'madeira', [(-w / 2 + 0.01, h - 0.05, zb), (w / 2 - 0.01, h - 0.05, zb)], 0.011, seg=6)
        for s in (-1, 1): ovo(M, 'tinta2', s * (w / 2 - 0.01), h - 0.05, zb, 0.016, 0.016, 0.016, seg=6, nv=3)
        for s in (-1, 1): tubo(M, 'corda', [(s * (w / 2 - 0.06), h - 0.05, zb), (0.0, h - 0.03, zb)], 0.0025, seg=4)
        bw = w - 0.08; top = h - 0.07; bh = h - 0.18
        lamina(M, 'tinta', lambda u, v: (-bw / 2 + bw * u, top - bh * v + (0.09 * (1 - abs(2 * u - 1)) * max(0.0, v - 0.86) / 0.14), zb + 0.006 + 0.006 * math.sin(v * 4 + u * 2)), 4, 8, both=True)
        # (the border: a band down each side and across the top, a hair before the banner)
        for x0, x1 in ((-bw / 2, -bw / 2 + 0.025), (bw / 2 - 0.025, bw / 2)):
            lamina(M, 'tinta2', lambda u, v, x0=x0, x1=x1: (x0 + (x1 - x0) * u, top - (bh * 0.86) * v, zb + 0.0085 + 0.006 * math.sin(v * 4 + 2 * (x0 + bw / 2) / bw)), 1, 6, both=True)
        lamina(M, 'tinta2', lambda u, v: (-bw / 2 + bw * u, top - 0.025 * v, zb + 0.0085 + 0.006 * math.sin(u * 2)), 4, 1, both=True)
        _emblema(M, civ, 0.0, top - bh * 0.45, zb + 0.0095 + 0.006 * math.sin(0.45 * 4 + 1), bw * 0.5)
        if not M.lod:
            for s in (-1, 1): tubo(M, 'tinta2', [(s * bw / 2, top - bh * 0.86, zb + 0.008), (s * bw / 2, top - bh * 0.86 - 0.07, zb + 0.008)], 0.006, seg=4, rs=[0.004, 0.009])
    return f

def petalas(M, w, d, h):
    # (petals scattered on a table at a feast: each its flower's colour, lying a little curled)
    rnd = R(11)
    for k in range(28 if M.lod == 0 else 12):
        x, z, a = rnd.uniform(-w / 2 + 0.02, w / 2 - 0.02), rnd.uniform(-d / 2 + 0.02, d / 2 - 0.02), rnd.uniform(0, TAU)
        M.at(x, 0.0, z, ry=a)
        with cor(lambda p: mul(flor((x, 0.0, z)), 0.85 + 0.25 * manchas(p, 300))):
            lamina(M, 'flor', lambda u, v: ((u - 0.5) * 0.026 * math.sin(math.pi * v + 0.2), 0.0012 + 0.002 * (u - 0.5) ** 2 * 4, (v - 0.5) * 0.034), 2, 2)
        M.pop()

def tranca(M, w, d, h):
    # (the bar across a locked door, inside: two iron brackets in the wall either side of the door, the beam laid in them)
    z0 = -d / 2
    for s in (-1, 1):
        x = s * (w / 2 - 0.05)
        caixa(M, 'ferro', (x - 0.02, 0.0, z0), (x + 0.02, 0.012, z0 + d * 0.8), ch=0.002)
        caixa(M, 'ferro', (x - 0.02, 0.0, z0 + d * 0.8 - 0.012), (x + 0.02, h * 0.82, z0 + d * 0.8), ch=0.002)
        caixa(M, 'ferro', (x - 0.03, 0.0, z0), (x + 0.03, h * 0.9, z0 + 0.006), ch=0.002)
        for yy in (0.02, h * 0.7): cilindro(M, 'ferro', x, yy, z0 + 0.008, 0.005, 0.004, seg=5)
    caixa(M, 'madeira2', (-w / 2, 0.014, z0 + 0.012), (w / 2, 0.014 + h * 0.62, z0 + d * 0.8 - 0.014), ch=0.008, jit=0.002, seed=3)

def porta_caida(M, w, d, h):
    # (a door broken in, its leaf fallen flat inside: the planks of it, two of them split and short at the end the blows came,
    # the iron straps bent off one of them)
    n = 5; pw = w / n; rnd = R(13)
    for k in range(n):
        x0 = -w / 2 + pw * k; L = d - (0.32 + 0.12 * rnd.random() if k in (1, 3) else 0.02)
        caixa(M, 'madeira', (x0 + 0.003, 0.0, -d / 2), (x0 + pw - 0.003, 0.035, -d / 2 + L), ch=0.004, jit=0.002, seed=k)
        if k in (1, 3):
            # (the split end: three slivers out of the broken plank)
            for j in range(3):
                sx = x0 + pw * (0.2 + 0.3 * j); sl = 0.06 + 0.08 * rnd.random()
                lamina(M, 'madeira', lambda u, v, sx=sx, sl=sl, L=L: (sx + (u - 0.5) * 0.018 * (1 - v), 0.012 + 0.02 * u * (1 - v), -d / 2 + L + sl * v), 1, 2, both=True)
    for z in (-d / 2 + 0.25, d / 2 - 0.3):
        caixa(M, 'madeira', (-w / 2 + 0.02, 0.035, z - 0.05), (w / 2 - 0.02, 0.06, z + 0.05), ch=0.004)
    caixa(M, 'ferro', (-w / 2, 0.06, -d / 2 + 0.22), (-w / 2 + w * 0.6, 0.066, -d / 2 + 0.26), ch=0.0015)
    tubo(M, 'ferro', [(-w / 2 + 0.02, 0.06, d / 2 - 0.3), (-w / 2 + w * 0.3, 0.075, d / 2 - 0.28), (-w / 2 + w * 0.55, 0.11, d / 2 - 0.22)], 0.004, seg=4)

def lascas(M, w, d, h):
    # (the splinters of the frame and the leaf on the floor by a door broken in)
    rnd = R(17)
    for k in range(18 if M.lod == 0 else 8):
        x, z, a = rnd.uniform(-w / 2 + 0.08, w / 2 - 0.08), rnd.uniform(-d / 2 + 0.08, d / 2 - 0.08), rnd.uniform(0, TAU); L = rnd.uniform(0.04, 0.13); wd = rnd.uniform(0.006, 0.018)
        M.at(x, 0.0, z, ry=a)
        lamina(M, 'madeira', lambda u, v, L=L, wd=wd: ((u - 0.5) * wd * (1 - v ** 2), 0.002 + 0.006 * u * (1 - v), (v - 0.5) * L), 1, 2, both=True)
        M.pop()

def dado(M, w, d, h):
    # (a die of bone or of wood: its corners worn round, its pips cut and darkened — one opposite six, two opposite five, three four)
    s = w / 2
    almofada(M, 'dado', (-s, 0.0, -s), (s, 2 * s, s), e=0.25, nu=12, nv=6)
    if M.lod: return  # (from afar, a die is a die: its pips are not seen)
    pip = s * 0.18
    def pips(n, ax, sg):
        L = {1: [(0, 0)], 2: [(-1, -1), (1, 1)], 3: [(-1, -1), (0, 0), (1, 1)], 4: [(-1, -1), (1, -1), (-1, 1), (1, 1)], 5: [(-1, -1), (1, -1), (0, 0), (-1, 1), (1, 1)], 6: [(-1, -1), (1, -1), (-1, 0), (1, 0), (-1, 1), (1, 1)]}[n]
        for a, b in L:
            o = [0.0, s, 0.0]; o[ax] += sg * (s + 0.0003); u, vv = [q for q in range(3) if q != ax]; o[u] += a * s * 0.5; o[vv] += b * s * 0.5
            with cor((44, 34, 26)):
                if ax == 1: disco(M, 'pinta', o[1], pip, seg=6, x=o[0], z=o[2])
                else:
                    def fp(uu, v, o=o, ax=ax, sg=sg):
                        t = uu * TAU; r = pip * v; q = list(o); i, j = [k for k in range(3) if k != ax]; q[i] += r * math.cos(t) * (sg if ax == 0 else 1); q[j] += r * math.sin(t)
                        return tuple(q)
                    lamina(M, 'pinta', fp, 6, 1, both=True)
    # (the faces: 1 up, 6 down; 2 to +x, 5 to -x; 3 to +z, 4 to -z)
    pips(1, 1, 1); pips(6, 1, -1); pips(2, 0, 1); pips(5, 0, -1); pips(3, 2, 1); pips(4, 2, -1)

def copo_dados(M, w, d, h):
    # (the cup the dice are shaken in: turned wood or sewn leather, set mouth down on the table after the throw)
    torno(M, 'copo', [(0.0, 0.034), (0.004, 0.036), (h - 0.006, 0.03), (h, 0.026), (h, 0.0001)], seg=14, sharp=55)
    torno(M, 'copo', [(0.0, 0.034), (0.006, 0.031), (0.006, 0.0001)], seg=14, cap0=False, cap1=False)
    if not M.lod:
        for k in range(2): tubo(M, 'copo', arco_pts((0, 0.012 + k * (h - 0.03), 0), 0.0355 - k * 0.005, 0, TAU, 14, plane='xz'), 0.0025, seg=4, closed=True)

def _tabuleta(M, x, z, a, th, face=True, up=0.0):
    """one painted tablet of the game, lying: its back (verso: the people's colour) or its face up (face: the figure of the card)"""
    w, d = 0.05, 0.075
    M.at(x, up, z, ry=a)
    caixa(M, 'borda', (-w / 2, 0.0, -d / 2), (w / 2, th, d / 2), ch=0.0012)
    if face:
        lamina(M, 'face', lambda u, v: (-w / 2 + 0.004 + (w - 0.008) * u, th + 0.0004, -d / 2 + 0.004 + (d - 0.008) * v), 1, 1, uvs=(1.0, 1.0))
    else:
        lamina(M, 'verso', lambda u, v: (-w / 2 + 0.003 + (w - 0.006) * u, th + 0.0004, -d / 2 + 0.003 + (d - 0.006) * v), 1, 1, uvs=(1.0, 1.0))
    M.pop()

def cartas(M, w, d, h):
    # (a hand of the game played out on the table: the tablets thrown face up in the middle, two hands of them fanned face down)
    th = 0.0035; rnd = R(19)
    for k in range(3): _tabuleta(M, -0.06 + 0.06 * k, 0.0, (k - 1) * 0.12, th, face=True)
    for s in (-1, 1):
        for k in range(4): _tabuleta(M, s * 0.07 + (k - 1.5) * 0.012, s * 0.07, s * 0.3 + (k - 1.5) * 0.18, th, face=False, up=k * th * 0.6)

def monte(M, w, d, h):
    # (the deck: the tablets stacked, their edges a little out of true, the top one face down)
    th = 0.0035; rnd = R(23)
    for k in range(8):
        a = rnd.uniform(-0.06, 0.06); ox, oz = rnd.uniform(-0.002, 0.002), rnd.uniform(-0.002, 0.002)
        _tabuleta(M, ox, oz, a, th, face=False, up=k * th)

# ------------------------------ the feast's platter of each people (its parts what the recipe spent: x-<parte>) ------------------------------
def _travessa(M, w, d):
    r = w / 2; oval = d / w
    torno(M, 'louca', [(0.0, r * 0.62), (0.006, r * 0.7), (0.012, r * 0.66), (0.02, r * 0.88), (0.03, r)], seg=24, sharp=55, cap1=False, oval=oval)
    torno(M, 'louca', [(0.03, r * 0.96), (0.016, r * 0.72), (0.016, 0.0001)], seg=24, cap0=False, cap1=False, sharp=40, oval=oval)
    return 0.016

def _assado(M, x, z, L, y, ave=False):
    """a roast: a joint — or a bird, its legs up —, browned and charred where the fire was, its juice under it"""
    def roast(p): c = DC.CROSTA; m = manchas(p, 70); c = mix(c, (176, 104, 50), max(0.0, m - 0.45) * 1.4); return mix(c, DC.CARVAO, max(0.0, manchas(p, 140) - 0.78) * 2.5)
    with cor(lambda p: mul(DC.SUCO, 0.75 + 0.3 * manchas(p, 60))): disco(M, 'x-carne', y + 0.0008, L * 0.6, seg=14, x=x, z=z, oval=0.7)
    with cor(roast):
        almofada(M, 'x-carne', (x - L / 2, y, z - L * 0.32), (x + L / 2, y + L * 0.42, z + L * 0.32), e=0.6, nu=12, nv=8)
        if ave:
            for s in (-1, 1): tubo(M, 'x-carne', [(x + L * 0.25, y + L * 0.3, z + s * L * 0.18), (x + L * 0.45, y + L * 0.48, z + s * L * 0.22)], L * 0.08, seg=6, rs=[L * 0.1, L * 0.06])
    if ave:
        with cor(DC.OSSO):
            for s in (-1, 1): ovo(M, 'x-carne', x + L * 0.47, y + L * 0.5, z + s * L * 0.22, L * 0.035, L * 0.03, L * 0.035, seg=5, nv=2)
    else:
        with cor(DC.OSSO): tubo(M, 'x-carne', [(x + L * 0.45, y + L * 0.18, z), (x + L * 0.62, y + L * 0.22, z)], L * 0.045, seg=6)

def _paes(M, pts, y, r=0.035, flat=False):
    for x, z, a in pts:
        M.at(x, y, z, ry=a)
        with cor(lambda p: mul(mix(DC.MIOLO, DC.CRUSTA, 0.85 if not flat else 0.6), 0.85 + 0.25 * manchas(p, 80))):
            if flat: torno(M, 'x-pao', [(0.0, r * 0.96), (0.004, r), (0.012, r * 0.92), (0.016, 0.0001)], seg=12, sharp=60)
            else: ovo(M, 'x-pao', 0, r * 0.55, 0, r, r * 0.6, r * 0.85, seg=10, nv=5)
        M.pop()

def _frutas(M, pts, y, c, r=0.022, uva=False):
    for x, z in pts:
        if uva:
            # (a bunch of grapes: a cone of small berries, its stem)
            k = 0
            for row in range(4):
                for j in range(5 - row):
                    a = j * TAU / (5 - row) + row; rr = 0.018 * (1 - row * 0.22)
                    with cor(lambda p: mul(c, 0.8 + 0.3 * manchas(p, 200))): ovo(M, 'x-fruta', x + rr * math.cos(a) + row * 0.012, y + 0.009 + row * 0.008, z + rr * math.sin(a), 0.008, 0.008, 0.008, seg=5, nv=3)
                    k += 1
        else:
            with cor(lambda p, x=x, z=z: mul(c, 0.8 + 0.3 * max(0.0, min(1.0, (p[1] - y) / (2 * r))))): ovo(M, 'x-fruta', x, y + r * 0.9, z, r, r * 0.92, seg=10, nv=5)
            with cor((90, 64, 36)): tubo(M, 'x-fruta', [(x, y + r * 1.8, z), (x + 0.002, y + r * 2.2, z)], 0.0012, seg=4)

def _peixes(M, y, n=2):
    for k in range(n):
        M.at(0.03 - 0.06 * k, 0.0, (k - 0.5) * 0.07, ry=0.25 - 0.5 * k)
        DC._peixe_assado(M, 0.2, y, P=lambda n: 'x-peixe', leve=True)
        M.pop()

def _tamales(M, pts, y):
    for x, z, a in pts:
        M.at(x, y, z, ry=a)
        with cor(lambda p: mul((176, 160, 96), 0.85 + 0.25 * manchas(p, 120))): almofada(M, 'x-milho', (-0.04, 0.0, -0.018), (0.04, 0.024, 0.018), e=0.55, nu=10, nv=5)
        with cor((214, 186, 112)): ovo(M, 'x-milho', 0.03, 0.014, 0.0, 0.012, 0.009, 0.012, seg=6, nv=3)
        M.pop()

def _feijao(M, x, z, y):
    # (the beans and the peppers of the garden in their sauce, a heap at one end of the platter)
    M.at(x, 0.0, z)
    with cor((120, 40, 30)): disco(M, 'x-horta', y + 0.003, 0.04, seg=12, alto=lambda a, v: 0.008 * (1 - v * v))
    DC.pedacos(M, 'x-horta', y + 0.008, 0.032, [((96, 44, 34), 0.006, 10), ((60, 120, 50), 0.008, 3)], 29)
    M.pop()

def comida_festa(civ):
    """the feast's platter of a people: what its feasts are made of — its parts each the part of the food the recipe spent"""
    def f(M, w, d, h):
        y = _travessa(M, w - 0.01, d - 0.01)
        if civ in ('romano', 'classico'):
            _assado(M, -0.03, 0.0, 0.2 if civ == 'classico' else 0.24, y)
            # (the Roman's: the suckling pig, an apple in its mouth)
            if civ == 'romano': _frutas(M, [(-0.17, 0.0)], y + 0.03, (186, 48, 40), r=0.02)
            _frutas(M, [(0.13, -0.06)], y, (96, 52, 86), uva=True); _frutas(M, [(0.14, 0.06), (0.1, 0.09)], y, (176, 54, 44))
            _paes(M, [(-0.17, 0.05, 0.2), (-0.17, -0.06, 1.1)], y, 0.03)
        elif civ == 'grego':
            _peixes(M, y, 2)
            _frutas(M, [(0.16, 0.04), (0.17, -0.03), (0.14, -0.08)], y, (110, 60, 96), r=0.016)
            _frutas(M, [(-0.17, 0.07)], y, (90, 110, 40), uva=True)
            _paes(M, [(-0.17, -0.06, 0.3)], y, 0.035, flat=True)
        elif civ == 'egipcio':
            _assado(M, 0.0, 0.0, 0.18, y, ave=True)
            _paes(M, [(-0.16, 0.05, 0.0), (-0.16, -0.05, 1.0), (0.16, 0.06, 0.4)], y, 0.03, flat=True)
            _frutas(M, [(0.15, -0.05), (0.17, -0.02), (0.13, -0.08), (0.16, -0.09)], y, (120, 66, 36), r=0.012)
        elif civ == 'nordico':
            _assado(M, -0.02, 0.0, 0.22, y)
            _paes(M, [(-0.17, 0.0, 0.0)], y, 0.05, flat=True)
            _frutas(M, [(0.14, 0.06), (0.16, -0.04), (0.11, -0.07)], y, (176, 42, 40))
        elif civ == 'asteca':
            _assado(M, -0.05, 0.0, 0.16, y, ave=True)
            _tamales(M, [(0.12, 0.05, 0.3), (0.14, -0.03, -0.2), (0.1, -0.08, 0.6)], y)
            _feijao(M, -0.17, 0.0, y)
    return f
