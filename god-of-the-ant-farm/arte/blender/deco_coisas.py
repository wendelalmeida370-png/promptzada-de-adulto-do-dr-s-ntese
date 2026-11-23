# deco_coisas: the small things the interiors show (the interiors 2.0, the front P5, D-740) — each a function of its size
# (w across, d deep, h high, in metres) drawing in the game's frame with the furniture's shapes (moveis_forma.py): Y up, the
# front toward +Z, centred on its rectangle. How a thing rests is said by its table (deco.py TABLE): 'base' — its foot at
# y = 0, on a top, a shelf, the floor —; 'pende' — hung by its top: the cord's end at (0, h, 0), the thing below it —;
# 'parede' — flat against a wall, its back at z = -d/2 (a cloth, a peg, the marks of charcoal). Never out of its box.
# The parts (what the game paints each in — js/dentro3d.js, by what the building and its people have):
#   louca (the cup, the bowl, the plate: fired clay where the people has had the potter's ware, turned wood where not),
#   barro (always clay: the amphora, the jar of beer, the pot of mead), madeira / madeira2 (wood and its darker second: the
#   peg, the rod, the logs and their bark), pano / pano2 (cloth and its second colour; hide where the people does not weave),
#   corda (cord, twine), palha (straw, wicker, the husk), saco (the sack's stuff: woven, or leather), comida (what is in a bowl
#   or on a plate: the dish), conteudo (what fills a basket: the fruit, the eggs), pao (bread, the tortilla), carne (the ham),
#   peixe (the fish), alho (the garlic), erva (the herbs), milho (the maize), cabaca (the gourd), queijo (the cheese),
#   lampada (the lamp: clay, or bronze), cera (the candle), castical (its holder), panela (a cooking pot: iron, bronze or clay),
#   ferro (iron: a tripod, a chain), carvao (the charcoal of the marks on a wall), teia (the cobweb).
# Nothing is drawn by chance: every jitter is a seeded generator's — the same thing, the same shape.
import math, random
from mathutils import Vector
from moveis_forma import caixa, torno, cilindro, tubo, curva, arco_pts, lamina, almofada, ovo, tora, TAU

def R(seed): return random.Random(seed)

# ------------------------------ helpers ------------------------------
def boca(M, part, y, r, fundo, dentro=None, seg=14):
    """the mouth of an open vessel: its inner wall from the lip (y, r) down to y - fundo, the dark bottom there (dentro: the
    part the inside is painted in — the drink seen in a cup, the dark of a jar)"""
    torno(M, part, [(y, r), (y - fundo * 0.6, r * 0.96), (y - fundo, r * 0.8)], seg=seg, cap0=False, cap1=False, sharp=70)
    torno(M, dentro or part, [(y - fundo, r * 0.8), (y - fundo, 0.0001)], seg=seg, cap0=False, cap1=False)

def alca(M, part, pts, r=0.008, seg=6, oval=0.7):
    """a handle: a bent tube through the control points"""
    tubo(M, part, curva(pts, 7), r, seg=seg, oval=oval)

def fio(M, part, a, b, r=0.004):
    """a cord between two points"""
    tubo(M, part, [a, b], r, seg=5)

# ------------------------------ the vessels of drink ------------------------------
def jarra(M, w, d, h):
    # (the jug of beer: a round belly, a short neck, a lip with a pinched spout, the handle from the neck to the shoulder)
    pf = [(0.0, 0.045), (0.006, 0.052), (0.03, 0.068), (0.11, 0.084), (0.17, 0.078), (0.215, 0.056), (0.245, 0.043), (0.275, 0.046), (h, 0.052)]
    torno(M, 'barro', pf, seg=16, sharp=55, cap1=False)
    boca(M, 'barro', h, 0.049, 0.05, 'liquido')
    alca(M, 'barro', [(-0.048, 0.262, 0), (-0.085, 0.25, 0), (-0.094, 0.18, 0), (-0.08, 0.12, 0)], 0.009)
    # (the spout: a little lip turned out on the far side)
    tubo(M, 'barro', [(0.046, h - 0.006, 0), (0.06, h + 0.001 - 0.004, 0)], 0.012, seg=6, oval=0.5)

def jarra_alta(M, w, d, h):
    # (the Egyptian beer jar: tall, ovoid, on a narrow foot, its mouth stopped with a cake of mud)
    pf = [(0.0, 0.03), (0.02, 0.045), (0.09, 0.08), (0.18, 0.088), (0.26, 0.07), (0.31, 0.045), (0.33, 0.04), (0.35, 0.046)]
    torno(M, 'barro', pf, seg=16, sharp=55, cap1=False)
    torno(M, 'tampa', [(0.335, 0.05), (0.35, 0.056), (0.372, 0.05), (0.385, 0.03), (h, 0.0001)], seg=12, cap0=True, cap1=False, sharp=60)

def anforeta(M, w, d, h):
    # (a small amphora of wine that stands on its own small foot: the long body, the shoulder, the neck, two handles, the stopper)
    pf = [(0.0, 0.03), (0.012, 0.036), (0.02, 0.03), (0.06, 0.055), (0.17, 0.088), (0.29, 0.096), (0.36, 0.088), (0.4, 0.06), (0.42, 0.03), (0.47, 0.027), (0.48, 0.034), (0.49, 0.03)]
    torno(M, 'barro', [(y * h / 0.5, r) for y, r in pf], seg=16, sharp=55, cap1=False)
    cilindro(M, 'tampa', 0, 0.48 * h / 0.5, 0, 0.026, 0.018, seg=10)
    for s in (-1, 1): alca(M, 'barro', [(s * 0.028, 0.465 * h / 0.5, 0), (s * 0.07, 0.455 * h / 0.5, 0), (s * 0.08, 0.41 * h / 0.5, 0), (s * 0.07, 0.36 * h / 0.5, 0)], 0.009)

def pote(M, w, d, h):
    # (the pot of mead: round, its mouth covered with a cloth tied under the lip)
    pf = [(0.0, 0.05), (0.01, 0.07), (0.07, 0.105), (0.15, 0.11), (0.21, 0.09), (0.24, 0.066), (0.25, 0.07)]
    torno(M, 'barro', pf, seg=16, sharp=55, cap1=False)
    def cover(u, v):
        a = u * TAU; rr = 0.088 * min(1.0, v * 1.15) + 0.004 * math.sin(a * 5) * v
        y = h - 0.004 - 0.04 * (v ** 2)
        return (rr * math.cos(a), y, rr * math.sin(a))
    lamina(M, 'pano', cover, 20, 6)
    tubo(M, 'corda', [(0.078 * math.cos(TAU * k / 16), 0.236, 0.078 * math.sin(TAU * k / 16)) for k in range(16)], 0.005, seg=5, closed=True)

def cabaca(M, w, d, h):
    # (the gourd of pulque: two lobes and a waist, a wooden plug, a cord round the waist to carry it by)
    pf = [(0.0, 0.03), (0.02, 0.065), (0.07, 0.092), (0.13, 0.085), (0.17, 0.055), (0.195, 0.045), (0.23, 0.06), (0.26, 0.058), (0.285, 0.035), (0.3, 0.018)]
    torno(M, 'cabaca', pf, seg=16, sharp=60, cap1=False)
    cilindro(M, 'madeira2', 0, 0.295, 0, 0.016, h - 0.295, seg=8)
    tubo(M, 'corda', [(0.047 * math.cos(TAU * k / 14), 0.195, 0.047 * math.sin(TAU * k / 14)) for k in range(14)], 0.005, seg=5, closed=True)

def jarro_madeira(M, w, d, h):
    # (the jug of a people without the potter: staves round it, two hoops, a lid, a handle of the same wood)
    from moveis_forma import aduelas, aros
    raio = lambda y: 0.078 - 0.012 * (y / h)
    aduelas(M, 'madeira', h - 0.012, raio, n=10, t=0.012, rings=4, chime=0.012)
    aros(M, 'ferro', h - 0.012, raio, [0.04, h - 0.05], larg=0.018, esp=0.004, seg=14)
    cilindro(M, 'madeira2', 0, h - 0.016, 0, 0.07, 0.016, seg=14)
    alca(M, 'madeira', [(-0.06, h - 0.05, 0), (-0.094, h - 0.07, 0), (-0.095, 0.11, 0), (-0.074, 0.06, 0)], 0.01, oval=0.6)

# ------------------------------ the cups ------------------------------
def caneca(M, w, d, h):
    # (the mug: a slightly flared body on a foot ring, its handle)
    pf = [(0.0, 0.032), (0.006, 0.038), (0.012, 0.036), (0.05, 0.04), (h - 0.008, 0.045), (h, 0.047)]
    torno(M, 'louca', pf, seg=14, sharp=55, cap1=False)
    boca(M, 'louca', h, 0.043, h * 0.7, 'liquido', seg=12)
    alca(M, 'louca', [(0.042, h - 0.02, 0), (0.07, h - 0.03, 0), (0.072, 0.045, 0), (0.04, 0.03, 0)], 0.007)

def taca(M, w, d, h):
    # (the skyphos of the Greeks and Romans: a deep bowl on a low foot, two flat handles at its lip)
    pf = [(0.0, 0.03), (0.008, 0.032), (0.014, 0.022), (0.025, 0.034), (0.05, 0.052), (h - 0.006, 0.06), (h, 0.061)]
    torno(M, 'louca', pf, seg=16, sharp=55, cap1=False)
    boca(M, 'louca', h, 0.058, h * 0.7, 'liquido', seg=14)
    for s in (-1, 1): alca(M, 'louca', [(s * 0.058, h - 0.012, 0), (s * 0.085, h - 0.01, 0), (s * 0.088, h - 0.026, 0), (s * 0.058, h - 0.032, 0)], 0.006, oval=0.5)

def copo(M, w, d, h):
    # (the cup of the Nile and of the lake: a bowl with no handle, its lip turned a little out)
    pf = [(0.0, 0.026), (0.006, 0.03), (0.02, 0.046), (h - 0.012, 0.055), (h, 0.058)]
    torno(M, 'louca', pf, seg=14, sharp=55, cap1=False)
    boca(M, 'louca', h, 0.055, h * 0.75, 'liquido', seg=12)

def caneca_madeira(M, w, d, h):
    # (the turned wooden cup of a people without the potter: thick walled, a small knob of a handle)
    pf = [(0.0, 0.036), (0.006, 0.042), (0.02, 0.046), (h - 0.006, 0.052), (h, 0.05)]
    torno(M, 'louca', pf, seg=12, sharp=55, cap1=False)
    boca(M, 'louca', h, 0.044, h * 0.72, 'liquido', seg=10)
    tubo(M, 'louca', [(0.05, h - 0.03, 0), (0.07, h - 0.034, 0), (0.07, h - 0.06, 0)], 0.009, seg=6, oval=0.7)

# ------------------------------ the bowls, the plates, the bread ------------------------------
def tigela(M, w, d, h):
    # (a bowl with what was served in it — the rice, the porridge, the stew: the dish's own colour)
    pf = [(0.0, 0.035), (0.006, 0.04), (0.012, 0.036), (0.03, 0.06), (h - 0.006, 0.082), (h, 0.084)]
    torno(M, 'louca', pf, seg=16, sharp=55, cap1=False)
    torno(M, 'louca', [(h, 0.08), (h * 0.5, 0.062)], seg=16, cap0=False, cap1=False)
    def top(u, v):
        a = u * TAU; rr = 0.074 * v; y = h - 0.01 + 0.012 * (1 - v * v) + 0.003 * math.sin(a * 3 + v * 5) * v
        return (rr * math.cos(a), y, rr * math.sin(a))
    lamina(M, 'comida', top, 16, 4)

def prato(M, w, d, h):
    # (a plate with three helpings of the dish on it: a meat, a stew, a cheese — the dish's own colour)
    pf = [(0.0, 0.07), (0.006, 0.078), (0.01, 0.07), (0.016, 0.09), (0.024, 0.115), (0.028, 0.118)]
    torno(M, 'louca', pf, seg=18, sharp=55, cap1=False)
    torno(M, 'louca', [(0.028, 0.112), (0.014, 0.08), (0.014, 0.0001)], seg=18, cap0=False, cap1=False, sharp=40)
    rnd = R(5)
    for k, (x, z, r) in enumerate(((-0.03, -0.015, 0.038), (0.035, -0.02, 0.032), (0.0, 0.035, 0.034))):
        torno(M, 'comida', [(0.014, r * 0.9), (0.02, r), (0.03 + rnd.uniform(0, 0.012), r * 0.7), (0.04 + rnd.uniform(0, 0.01), 0.0001)], seg=10, x=x, z=z, oval=0.8 + 0.2 * rnd.random(), cap0=False, cap1=False, sharp=70)

def prato_peixe(M, w, d, h):
    # (a long plate with a fish on it, whole)
    pf = [(0.0, 0.07), (0.006, 0.08), (0.012, 0.075), (0.02, 0.11), (0.026, 0.13)]
    torno(M, 'louca', pf, seg=18, sharp=55, cap1=False, oval=0.62)
    torno(M, 'louca', [(0.026, 0.125), (0.013, 0.08), (0.013, 0.0001)], seg=18, cap0=False, cap1=False, sharp=40, oval=0.62)
    _peixe(M, 'comida', 0.0, 0.03, 0.0, 0.2, deitado=True)

def _peixe(M, part, x, y, z, L, deitado=False, pendurado=False):
    """a fish L long: its body a squashed lathe along its length, its tail a fin"""
    from mathutils import Matrix
    pf = [(0.0, 0.0001), (0.06, 0.32), (0.35, 0.5), (0.6, 0.42), (0.85, 0.16), (0.9, 0.12)]
    if pendurado: rot = Matrix.Rotation(math.pi, 4, 'X')   # (head down: the body along -Y from the tie)
    elif deitado: rot = Matrix.Rotation(-math.pi / 2, 4, 'Z') @ Matrix.Rotation(math.pi / 2, 4, 'Y')
    else: rot = None
    H = L * 0.42; ox = x - L / 2 if deitado else x
    torno(M, part, [(L * a, H * r * 0.5) for a, r in pf], seg=10, x=ox, y=y, z=z, oval=0.35, rot=rot, cap0=False, sharp=70)
    # (the tail: a fin spread at the end of the body)
    def fin(u, v, ox=ox):
        s = (u - 0.5) * 2; along = L * (0.88 + 0.16 * v); spread = H * 0.25 * (0.4 + 1.1 * v) * s
        if pendurado: return (x + spread, y - along, z)
        if deitado: return (ox + along, y, z + spread)
        return (x + spread, y + along, z)
    lamina(M, part, fin, 2, 2, both=True)

def pao(M, w, d, h):
    # (a round loaf, risen and cracked along its top: the crust darker on it)
    pf = [(0.0, 0.072), (0.006, 0.082), (0.02, 0.088), (0.045, 0.084), (0.07, 0.062), (0.088, 0.03), (h, 0.0001)]
    torno(M, 'pao', pf, seg=16, sharp=70, cap1=False)
    for s in (-1, 1): tubo(M, 'pao', [(-0.05, h - 0.022, s * 0.018), (0.0, h - 0.006, s * 0.02), (0.05, h - 0.022, s * 0.018)], 0.006, seg=5, oval=0.5)

def tortilhas(M, w, d, h):
    # (a stack of maize cakes: each edge a little out of the one under it — one turned outline, its rims)
    pf = [(0.0, 0.078)]
    for k in range(5):
        y = k * 0.0068; r = 0.08 + (0.003 if k % 2 else -0.001)
        pf += [(y + 0.0012, r), (y + 0.0056, r), (y + 0.0068, r - 0.004)]
    pf += [(h - 0.0005, 0.0001)]
    torno(M, 'pao', pf, seg=16, sharp=40, cap1=False)

def queijo(M, w, d, h):
    # (a wheel of cheese, its rind bulging)
    pf = [(0.0, 0.088), (0.005, 0.096), (h * 0.5, 0.104), (h - 0.005, 0.096), (h, 0.088)]
    torno(M, 'queijo', pf, seg=18, sharp=60)

# ------------------------------ what hangs ------------------------------
def presunto(M, w, d, h):
    # (a ham hung by its knuckle: the cord from the hook, a binding round the shank, the lean and the fat of the leg)
    top = h; fio(M, 'corda', (0, top, 0), (0, top - 0.09, 0), 0.004)
    from mathutils import Matrix
    pf = [(0.0, 0.0001), (0.02, 0.05), (0.07, 0.072), (0.15, 0.07), (0.24, 0.05), (0.3, 0.03), (0.34, 0.022), (0.36, 0.0001)]
    torno(M, 'carne', [(y, r) for y, r in pf], seg=14, y=top - 0.09 - 0.36, oval=0.75, cap0=False, cap1=False, sharp=70)
    for y in (top - 0.12, top - 0.2): tubo(M, 'corda', [(0.03 * math.cos(TAU * k / 10), y, 0.022 * math.sin(TAU * k / 10)) for k in range(10)], 0.0035, seg=4, closed=True)

def peixe_seco(M, w, d, h):
    # (two fish dried, hung by a cord through their gills)
    top = h; fio(M, 'corda', (0, top, 0), (0, top - 0.05, 0), 0.004)
    fio(M, 'corda', (-0.035, top - 0.05, 0), (0.035, top - 0.05, 0), 0.004)
    for s in (-1, 1): _peixe(M, 'peixe', s * 0.035, top - 0.05, 0.0, h - 0.07, pendurado=True)

def alho(M, w, d, h):
    # (a braid of garlic: the stalks plaited into a cord, the heads all along it to either side)
    top = h; fio(M, 'palha', (0, top, 0), (0, 0.06, 0), 0.007)
    rnd = R(3)
    n = 8
    for k in range(n):
        y = top - 0.07 - (top - 0.12) * k / (n - 1); s = 1 if k % 2 else -1
        x, z = s * 0.032, (0.016 if k % 3 == 0 else -0.012)
        r = 0.026 + rnd.uniform(-0.003, 0.003)
        torno(M, 'alho', [(0.0, 0.004), (r * 0.5, r * 0.95), (r * 1.2, r * 0.85), (r * 1.8, r * 0.25), (r * 2.2, 0.0001)], seg=8, x=x, y=y - r, z=z, cap1=False, sharp=70)

def ervas(M, w, d, h):
    # (a bunch of herbs hung head down to dry: the stems tied at the top, the leaves fanning out below)
    top = h; tie = top - 0.04; fio(M, 'corda', (0, top, 0), (0, tie, 0), 0.0035)
    tubo(M, 'corda', [(0.012 * math.cos(TAU * k / 8), tie, 0.012 * math.sin(TAU * k / 8)) for k in range(8)], 0.004, seg=4, closed=True)
    rnd = R(7)
    n = 9 if M.lod == 0 else 6
    for k in range(n):
        a = TAU * k / n + rnd.uniform(-0.2, 0.2); s = 0.5 + rnd.random() * 0.5
        x1, z1 = math.cos(a) * 0.06 * s, math.sin(a) * 0.04 * s; y1 = 0.02 + rnd.uniform(0, 0.06)
        tubo(M, 'erva', [(0, tie + 0.02, 0), (x1 * 0.4, tie - 0.08, z1 * 0.4), (x1, y1, z1)], 0.003, seg=4)
        # (a few leaves along each stem)
        for q in ((0.35, 0.65, 0.9) if M.lod == 0 else (0.6,)):
            cx, cy, cz = x1 * q, tie - (tie - y1) * q, z1 * q; L = 0.035
            def leaf(u, v, cx=cx, cy=cy, cz=cz, a=a):
                sw = (u - 0.5) * 0.02 * math.sin(math.pi * v); return (cx + math.cos(a) * L * 0.4 * v + math.cos(a + 1.57) * sw, cy - L * v, cz + math.sin(a) * L * 0.4 * v + math.sin(a + 1.57) * sw)
            lamina(M, 'erva', leaf, 2, 2, both=True)

def milho(M, w, d, h):
    # (three cobs of maize tied by their husks, the husks folded back up over the tie)
    top = h; tie = top - 0.06; fio(M, 'corda', (0, top, 0), (0, tie, 0), 0.004)
    for k, (x, z) in enumerate(((-0.035, 0.0), (0.035, 0.01), (0.0, -0.03))):
        L = h - 0.1 - 0.02 * k
        torno(M, 'milho', [(0.0, 0.0001), (0.02, 0.018), (0.06, 0.023), (L * 0.7, 0.021), (L - 0.01, 0.012), (L, 0.0001)], seg=10, x=x, y=tie - 0.02 - L, z=z, cap0=False, cap1=False, sharp=70)
        for s in (-1, 1):
            def husk(u, v, x=x, z=z, s=s):
                sw = (u - 0.5) * 0.03 * math.sin(math.pi * (0.2 + 0.8 * v)); return (x + s * 0.012 + s * 0.02 * v + sw, tie - 0.02 + 0.05 * v, z + 0.006 * s)
            lamina(M, 'palha', husk, 2, 3, both=True)

# ------------------------------ what stands on the floor ------------------------------
def saco(M, w, d, h):
    # (a sack of grain: slumped on its foot, gathered at the neck and tied)
    pf = [(0.0, 0.12), (0.02, 0.145), (0.1, 0.162), (0.26, 0.152), (0.34, 0.12), (0.39, 0.07), (0.41, 0.05), (0.44, 0.045), (0.47, 0.058), (0.49, 0.04), (h, 0.0001)]
    torno(M, 'saco', pf, seg=16, sharp=70, oval=0.85, cap1=False)
    tubo(M, 'corda', [(0.05 * math.cos(TAU * k / 12), 0.415, 0.043 * math.sin(TAU * k / 12)) for k in range(12)], 0.006, seg=5, closed=True)

def cesto(M, w, d, h):
    # (a basket of wicker with its handle, full: what it holds heaped over its rim)
    hb = 0.17; pf = [(0.0, 0.1), (0.008, 0.112), (hb, 0.15)]
    torno(M, 'palha', pf, seg=18, sharp=70, cap1=False)
    torno(M, 'palha', [(hb, 0.145), (0.012, 0.106), (0.012, 0.0001)], seg=18, cap0=False, cap1=False, sharp=40)
    tubo(M, 'palha', [(0.15 * math.cos(TAU * k / 14), hb, 0.15 * math.sin(TAU * k / 14)) for k in range(14)], 0.008, seg=4, closed=True)
    tubo(M, 'palha', arco_pts((0, hb, 0), 0.145, 0, math.pi, 8, plane='xy'), 0.008, seg=4)
    rnd = R(9)
    for k in range(7):
        a = TAU * k / 7 + rnd.uniform(-0.25, 0.25); rr = 0.08 * (0.3 + 0.7 * (k % 3) / 2)
        x, z = math.cos(a) * rr, math.sin(a) * rr; r = 0.038 + rnd.uniform(-0.006, 0.004)
        ovo(M, 'conteudo', x, hb - 0.01 + r * (0.6 + 0.4 * (1 - rr / 0.08)), z, r, r * 0.92, seg=8, nv=4)

def lenha(M, w, d, h):
    # (split logs stacked against the wall by the fire: three, two, one, their ends seen)
    r = 0.055; rows = [(-0.12, 0.0, 0.12), (-0.06, 0.06), (0.0,)]
    k = 0
    for j, row in enumerate(rows):
        for z in row:
            y = r + j * r * 1.72; L = w - 0.04 - 0.04 * ((k * 7) % 3)
            tora(M, 'madeira2', (-L / 2, y, z), (L / 2, y + 0.004 * ((k % 2) - 0.5), z), r * (0.9 + 0.12 * ((k * 5) % 3) / 2), seg=8, seed=k, casca='madeira2', cerne='madeira')
            k += 1

def panela(M, w, d, h):
    # (a cooking pot with its lid and two lugs: of iron, of bronze, or of clay)
    pf = [(0.0, 0.07), (0.01, 0.09), (0.06, 0.12), (0.13, 0.118), (0.17, 0.1), (0.18, 0.102)]
    torno(M, 'panela', pf, seg=16, sharp=55)
    torno(M, 'panela', [(0.178, 0.098), (0.19, 0.096), (0.205, 0.07), (0.212, 0.02), (0.212, 0.0001)], seg=16, cap0=False, cap1=False, sharp=50)
    cilindro(M, 'panela', 0, 0.212, 0, 0.016, h - 0.212, seg=8)
    for s in (-1, 1): tubo(M, 'panela', [(s * 0.112, 0.15, 0), (s * 0.135, 0.152, 0), (s * 0.135, 0.13, 0)], 0.008, seg=5)

def caldeirao(M, w, d, h):
    # (the cauldron over the long fire: three legs of iron to a ring at the top, the chain, the pot hung on its bail)
    top = h - 0.02
    for k in range(3):
        a = TAU * k / 3 + 0.5; tubo(M, 'ferro', [(math.cos(a) * (w / 2 - 0.02), 0.0, math.sin(a) * (d / 2 - 0.02)), (math.cos(a) * 0.03, top, math.sin(a) * 0.03)], 0.009, seg=6)
    tubo(M, 'ferro', [(0.035 * math.cos(TAU * k / 8), top - 0.005, 0.035 * math.sin(TAU * k / 8)) for k in range(8)], 0.008, seg=4, closed=True)
    fio(M, 'ferro', (0, top - 0.01, 0), (0, 0.43, 0), 0.005)
    tubo(M, 'ferro', arco_pts((0, 0.3, 0), 0.13, 0.15, math.pi - 0.15, 8, plane='xy'), 0.005, seg=5)
    pf = [(0.12, 0.05), (0.13, 0.1), (0.17, 0.135), (0.25, 0.14), (0.3, 0.128), (0.31, 0.13)]
    torno(M, 'panela', pf, seg=16, sharp=55, cap1=False)
    boca(M, 'panela', 0.31, 0.126, 0.05, 'liquido', seg=14)

def lamparina(M, w, d, h):
    # (the oil lamp: a closed body with its filling hole, the nozzle for the wick in front, a ring of a handle behind)
    from mathutils import Matrix
    pf = [(0.0, 0.025), (0.004, 0.034), (0.018, 0.042), (0.03, 0.036), (0.034, 0.016), (0.03, 0.012), (0.034, 0.0001)]
    torno(M, 'lampada', pf, seg=14, z=-0.01, sharp=60, cap1=False, oval=0.85)
    tubo(M, 'lampada', [(0.0, 0.02, 0.02), (0.0, 0.022, 0.052), (0.0, 0.026, 0.068)], 0.011, seg=8, oval=0.6, rs=[0.014, 0.011, 0.008])
    tubo(M, 'lampada', arco_pts((0, 0.03, -0.055), 0.012, -math.pi / 2, math.pi / 2, 6, plane='yz'), 0.004, seg=4)
    M.anchor('chama', 0.0, 0.034, 0.07, 0.0, 0.0)

def vela(M, w, d, h):
    # (a candle in its holder: the dish, the socket, the wax, the wick)
    torno(M, 'castical', [(0.0, 0.035), (0.005, 0.042), (0.012, 0.04), (0.014, 0.014), (0.04, 0.012), (0.05, 0.02), (0.055, 0.018)], seg=14, sharp=55)
    cilindro(M, 'cera', 0, 0.05, 0, 0.0145, h - 0.065, seg=10)
    torno(M, 'cera', [(h - 0.015, 0.0145), (h - 0.008, 0.012), (h - 0.006, 0.0001)], seg=10, cap0=False, cap1=False)
    fio(M, 'corda', (0, h - 0.007, 0), (0, h, 0), 0.0015)
    M.anchor('chama', 0.0, h, 0.0, 0.0, 0.0)

# ------------------------------ cloth ------------------------------
def pano_dobrado(M, w, d, h):
    # (blankets folded and laid one on the other on a chest, a bench)
    for k, (part, y0, y1, ins) in enumerate((('pano', 0.0, 0.045, 0.0), ('pano2', 0.045, 0.085, 0.015), ('pano', 0.085, h, 0.03))):
        almofada(M, part, (-w / 2 + ins + 0.004 * k, y0, -d / 2 + ins), (w / 2 - ins * 0.6, y1, d / 2 - ins * 0.8), e=0.25, nu=8, nv=4)

def tapete(M, w, d, h):
    # (a rug: its field, its border, a fringe at either end — laid flat on the floor)
    b = 0.12
    def sheet(x0, x1, z0, z1, y):
        return lambda u, v: (x0 + (x1 - x0) * v, y, z0 + (z1 - z0) * u)
    lamina(M, 'pano', sheet(-w / 2 + b, w / 2 - b, -d / 2 + b, d / 2 - b, h), 4, 3)
    for (x0, x1, z0, z1) in ((-w / 2, w / 2, -d / 2, -d / 2 + b), (-w / 2, w / 2, d / 2 - b, d / 2), (-w / 2, -w / 2 + b, -d / 2 + b, d / 2 - b), (w / 2 - b, w / 2, -d / 2 + b, d / 2 - b)):
        lamina(M, 'pano2', sheet(x0, x1, z0, z1, h), 3, 1)
    # (the edge: a strip down to the floor all round)
    for (a, c) in (((-w / 2, -d / 2), (w / 2, -d / 2)), ((w / 2, -d / 2), (w / 2, d / 2)), ((w / 2, d / 2), (-w / 2, d / 2)), ((-w / 2, d / 2), (-w / 2, -d / 2))):
        lamina(M, 'pano2', lambda u, v, a=a, c=c: (a[0] + (c[0] - a[0]) * u, h * (1 - v), a[1] + (c[1] - a[1]) * u), 1, 1)
    # (the fringe: short tassels along the short ends — at w the rug's length)
    if M.lod == 0:
        for s in (-1, 1):
            for k in range(9):
                z = -d / 2 + 0.06 + (d - 0.12) * k / 8; tubo(M, 'pano2', [(s * (w / 2 - 0.004), h - 0.002, z), (s * (w / 2 - 0.05), h - 0.002, z + 0.004)], 0.0025, seg=3)

def tapecaria(M, w, d, h):
    # (a hanging of cloth on a rod, against the wall: its folds a little, a band at its foot and its head)
    zb = -d / 2 + 0.012
    tubo(M, 'madeira', [(-w / 2, h - 0.02, zb + 0.012), (w / 2, h - 0.02, zb + 0.012)], 0.012, seg=8)
    def cloth(u, v): return (w / 2 - 0.04 - (w - 0.08) * u, h - 0.04 - (h - 0.06) * v, zb + 0.018 + 0.008 * math.sin(u * TAU * 4) * (0.3 + 0.7 * v))
    lamina(M, 'pano', cloth, 16, 6, both=False)
    for v0, v1 in ((0.0, 0.08), (0.9, 1.0)):
        def band(u, v, v0=v0, v1=v1): vv = v0 + (v1 - v0) * v; x, y, z = cloth(u, vv); return (x, y, z + 0.002)
        lamina(M, 'pano2', band, 16, 1)

# ------------------------------ on the walls ------------------------------
def cavilha(M, w, d, h):
    # (a wooden peg driven into the wall, its head thicker)
    from mathutils import Matrix
    rot = Matrix.Rotation(math.pi / 2, 4, 'X')
    torno(M, 'madeira2', [(-d / 2, 0.011), (d / 2 - 0.015, 0.009), (d / 2 - 0.012, 0.014), (d / 2, 0.012)], seg=8, y=h / 2, rot=rot, sharp=60)

def suporte(M, w, d, h):
    # (a little shelf on the wall for a lamp: its board, the cleat nailed to the wall, the brace under it)
    zb = -d / 2
    caixa(M, 'madeira', (-w / 2, h - 0.024, zb), (w / 2, h, d / 2), ch=0.004)
    caixa(M, 'madeira2', (-0.022, 0.0, zb), (0.022, h - 0.024, zb + 0.022), ch=0.003)
    tubo(M, 'madeira2', [(0.0, 0.012, zb + 0.02), (0.0, h - 0.03, d / 2 - 0.035)], 0.01, seg=5)

def _risco(M, a, b, t=0.006, z=0.0):
    """a stroke of charcoal on the wall from a to b (x, y): a thin flat box a hair proud of the wall"""
    from mathutils import Matrix
    dx, dy = b[0] - a[0], b[1] - a[1]; L = math.hypot(dx, dy) or 0.001; ang = math.atan2(dy, dx)
    M.push(Matrix.Translation(((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z)) @ Matrix.Rotation(ang, 4, 'Z'))
    caixa(M, 'carvao', (-L / 2, -t / 2, 0.0), (L / 2, t / 2, 0.0015), ch=0.0)
    M.pop()

def rabisco(estilo):
    # (what the customers of years scratched in charcoal on the wall: tallies of the rounds, a ship, a face, a name — each a few strokes)
    def f(M, w, d, h):
        z = -d / 2 + 0.0005
        if estilo == 'a':   # (the tallies: groups of four crossed by a fifth)
            for g in range(3):
                x0 = -w / 2 + 0.02 + g * 0.09
                for k in range(4): _risco(M, (x0 + k * 0.016, 0.03), (x0 + k * 0.016 + 0.004, 0.11), z=z)
                _risco(M, (x0 - 0.008, 0.045), (x0 + 0.06, 0.1), z=z)
        elif estilo == 'b':  # (a ship: its hull, its mast, its sail)
            _risco(M, (-0.1, 0.06), (0.1, 0.06), z=z); _risco(M, (-0.1, 0.06), (-0.13, 0.1), z=z); _risco(M, (0.1, 0.06), (0.13, 0.1), z=z)
            _risco(M, (0.0, 0.06), (0.0, 0.2), z=z); _risco(M, (0.0, 0.2), (0.07, 0.12), z=z); _risco(M, (0.07, 0.12), (0.0, 0.1), z=z)
        elif estilo == 'c':  # (a face: round, two eyes, a grin)
            pts = arco_pts((0, 0.11, 0), 0.07, 0, TAU, 10)
            for k in range(10): _risco(M, pts[k][:2], pts[k + 1][:2], z=z)
            _risco(M, (-0.025, 0.13), (-0.02, 0.135), z=z); _risco(M, (0.02, 0.13), (0.025, 0.135), z=z)
            sm = arco_pts((0, 0.11, 0), 0.04, math.pi * 1.15, math.pi * 1.85, 4)
            for k in range(4): _risco(M, sm[k][:2], sm[k + 1][:2], z=z)
        else:                # (a name, or what passes for one: a line of signs)
            x = -w / 2 + 0.02
            for k in range(7):
                rnd = R(31 + k); x1 = x + 0.025; _risco(M, (x, 0.04 + rnd.uniform(0, 0.02)), (x1, 0.1 + rnd.uniform(-0.02, 0.01)), z=z)
                if k % 2: _risco(M, (x, 0.07), (x1, 0.07 + rnd.uniform(-0.01, 0.01)), z=z)
                x = x1 + 0.01
    return f

def teia(M, w, d, h):
    # (a cobweb in the top corner of two walls under the ceiling: the threads from the corner, the rounds across them)
    c = Vector((-w / 2 + 0.002, h - 0.002, -d / 2 + 0.002))
    ends = [Vector((w / 2 - 0.02, h - 0.004, -d / 2 + 0.003)), Vector((w * 0.15, h - 0.004, d * 0.1)), Vector((-w / 2 + 0.003, h - 0.004, d / 2 - 0.02)),
            Vector((-w / 2 + 0.003, h * 0.2, d * 0.15)), Vector((-w / 2 + 0.003, h * 0.05, -d / 2 + 0.003)), Vector((w * 0.1, h * 0.25, -d / 2 + 0.003))]
    for e in ends: tubo(M, 'teia', [tuple(c), tuple(e)], 0.0012, seg=3, caps=False)
    for k in (0.3, 0.55, 0.8):
        pts = [tuple(c.lerp(e, k)) for e in ends]
        for a, b in zip(pts, pts[1:]): tubo(M, 'teia', [a, b], 0.001, seg=3, caps=False)
