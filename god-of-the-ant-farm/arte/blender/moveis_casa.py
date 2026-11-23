# moveis_casa: the pieces of before that the tavern of today still has (int-moveis.js, their sizes) — the interiors 2.0, the front P2
# (D-710): the table of the yard with its two benches (2,20 × 1,70 × 0,75, the seats at 0,45, ±0,675 from its middle), the great
# jar that keeps (the talha, 0,60 × 0,60 × 1,20), the jars of the pantry (0,90 × 0,50 × 0,75), the stove against the wall
# (1,20 × 0,60 × 0,90, its hood over it and the flue to the ceiling: chamine), the hearth on the floor (0,80 × 1,20 × 0,25), the
# sleeping mats (0,72 × 1,80 × 0,06; of two, 1,25 × 1,85 × 0,08). The frame, the parts and the rules: moveis_pecas.py.
import math
from moveis_forma import caixa, tabua, tampo, torno, cilindro, tubo, curva, lamina, almofada, ovo, pedra, brasas, tora, TAU
from moveis_pecas import poste, quatro
from moveis_fogo import coifa, tripe_panela, lenha

# ------------------------------ a mesa do terreiro (the table with its benches) ------------------------------
def mesa_terreiro(style):
    def tabuas(M, w, d, h, pintado=False):
        # (the table of the yard: a top of three planks on two board legs and a stretcher; a bench along each side, its seat at
        # 0,45 where the plan seats who eats)
        nb = d / 2 - 0.175; tw = 0.8
        tampo(M, 'madeira', -w / 2 + 0.05, w / 2 - 0.05, -tw / 2, tw / 2, h - 0.045, h, 3, along='x', gap=0.007, seed=2600)
        for s in (-1, 1):
            x = s * (w / 2 - 0.32)
            tabua(M, 'madeira2', (x - 0.03, 0, -0.3), (x + 0.03, h - 0.045, 0.3), grain='y', seed=2601 + s)
            tabua(M, 'madeira2', (x - 0.035, 0, -0.36), (x + 0.035, 0.06, 0.36), grain='z', seed=2603 + s)
        tabua(M, 'pintura' if pintado else 'madeira2', (-w / 2 + 0.36, 0.2, -0.03), (w / 2 - 0.36, 0.26, 0.03), grain='x', seed=2605)
        for e in (-1, 1):
            tabua(M, 'madeira', (-w / 2 + 0.05, 0.405, e * nb - 0.15), (w / 2 - 0.05, 0.45, e * nb + 0.15), grain='x', seed=2610 + e)
            for s in (-1, 1): tabua(M, 'madeira2', (s * (w / 2 - 0.22) - 0.025, 0, e * nb - 0.12), (s * (w / 2 - 0.22) + 0.025, 0.405, e * nb + 0.12), grain='y', seed=2612 + s)
        M.anchor('tampo', 0, h, 0, w - 0.2, tw - 0.1)
    def cavalete(M, w, d, h):
        # (the Norse: a trestle table and two split-log benches beside it)
        nb = d / 2 - 0.175; tw = 0.8
        tampo(M, 'madeira', -w / 2 + 0.05, w / 2 - 0.05, -tw / 2, tw / 2, h - 0.05, h, 3, along='x', gap=0.008, seed=2620)
        for s in (-1, 1):
            x = s * (w / 2 - 0.35)
            tabua(M, 'madeira2', (x - 0.03, 0, -0.3), (x + 0.03, 0.07, 0.3), grain='z', seed=2621 + s)
            tabua(M, 'madeira2', (x - 0.025, 0.07, -0.12), (x + 0.025, h - 0.1, 0.12), grain='y', seed=2623 + s)
            tabua(M, 'madeira2', (x - 0.03, h - 0.1, -0.34), (x + 0.03, h - 0.05, 0.34), grain='z', seed=2625 + s)
        tabua(M, 'madeira2', (-w / 2 + 0.25, 0.26, -0.03), (w / 2 - 0.25, 0.32, 0.03), grain='x', seed=2627)
        for e in (-1, 1):
            tabua(M, 'madeira', (-w / 2 + 0.05, 0.39, e * nb - 0.14), (w / 2 - 0.05, 0.45, e * nb + 0.14), ch=0.012, grain='x', seed=2630 + e, jit=0.004)
            for s in (-1, 1):
                for t in (-1, 1): tubo(M, 'madeira2', [(s * (w / 2 - 0.25) + s * 0.04, 0, e * nb + t * 0.09), (s * (w / 2 - 0.25), 0.4, e * nb + t * 0.04)], 0.02, seg=6)
        M.anchor('tampo', 0, h, 0, w - 0.2, tw - 0.1)
    def asteca(M, w, d, h):
        # (the Aztec: a plank top on blocks, two benches of planks on blocks, the people's colour on their faces)
        nb = d / 2 - 0.175; tw = 0.8
        tampo(M, 'madeira', -w / 2 + 0.05, w / 2 - 0.05, -tw / 2, tw / 2, h - 0.05, h, 3, along='x', seed=2640)
        for s in (-1, 1):
            x = s * (w / 2 - 0.35); caixa(M, 'madeira2', (x - 0.08, 0, -0.25), (x + 0.08, h - 0.05, 0.25), ch=0.012, grain='y')
            caixa(M, 'pintura', (x - 0.082, 0.2, -0.252), (x + 0.082, 0.3, 0.252), ch=0.003, grain='x')
        for e in (-1, 1):
            tabua(M, 'madeira', (-w / 2 + 0.05, 0.4, e * nb - 0.15), (w / 2 - 0.05, 0.45, e * nb + 0.15), ch=0.012, grain='x', seed=2641 + e)
            for s in (-1, 1): caixa(M, 'madeira2', (s * (w / 2 - 0.25) - 0.06, 0, e * nb - 0.11), (s * (w / 2 - 0.25) + 0.06, 0.4, e * nb + 0.11), ch=0.01, grain='y')
        M.anchor('tampo', 0, h, 0, w - 0.2, tw - 0.1)
    if style == 'grego': return lambda M, w, d, h: tabuas(M, w, d, h, pintado=True)
    return {'tabuas': tabuas, 'cavalete': cavalete, 'asteca': asteca}[style]

# ------------------------------ a talha and the jars ------------------------------
def talha(style):
    def pithos(M, w, d, h):
        # (the great jar that keeps — the dolium, the pithos —: its broad shoulder, a rolled lip, bands of rope pressed into the clay)
        r = min(w, d) / 2 - 0.01
        pf = [(0.0, 0.11), (0.03, 0.15), (0.2, r * 0.82), (0.45, r), (0.7, r * 0.97), (h - 0.24, r * 0.78), (h - 0.1, r * 0.48), (h - 0.05, r * 0.45), (h - 0.02, r * 0.52), (h, r * 0.5), (h - 0.03, r * 0.42)]
        torno(M, 'barro', pf, seg=18, sharp=60, cap1=False)
        for y in (0.45, 0.75):
            rr = r * (1.0 if y < 0.6 else 0.94); torno(M, 'barro', [(y - 0.012, rr), (y, rr + 0.012), (y + 0.012, rr)], seg=18, cap0=False, cap1=False)
        torno(M, 'liquido', [(h - 0.06, r * 0.42), (h - 0.06, 0.0001)], seg=12, cap0=False, cap1=False)
        M.anchor('tampo', 0, h, 0, r * 0.8, r * 0.8)
    def zir(M, w, d, h):
        # (the Egyptian zir: tall, its point set in a ring of mud, a lid of reed over its mouth)
        r = min(w, d) / 2 - 0.02
        torno(M, 'reboco', [(0.0, r * 0.62), (0.08, r * 0.6), (0.1, r * 0.4), (0.0, r * 0.4)], seg=14, cap0=False, cap1=True, sharp=50)
        pf = [(0.04, 0.06), (0.15, r * 0.55), (0.45, r), (0.75, r * 0.95), (h - 0.2, r * 0.62), (h - 0.08, r * 0.42), (h - 0.03, r * 0.46), (h - 0.01, r * 0.44)]
        torno(M, 'barro', pf, seg=16, sharp=60, cap1=False)
        cilindro(M, 'palha', 0, h - 0.02, 0, r * 0.5, 0.025, seg=14)
        M.anchor('tampo', 0, h, 0, r * 0.7, r * 0.7)
    def olla(M, w, d, h):
        # (the Aztec's great olla: round, its neck short, painted in a band)
        r = min(w, d) / 2 - 0.01
        pf = [(0.0, 0.08), (0.06, r * 0.7), (0.3, r * 0.98), (0.55, r), (0.8, r * 0.85), (h - 0.18, r * 0.55), (h - 0.08, r * 0.45), (h - 0.03, r * 0.5), (h, r * 0.48)]
        torno(M, 'barro', pf, seg=16, sharp=60, cap1=False)
        torno(M, 'pintura', [(0.5, r * 0.997), (0.55, r * 1.005), (0.6, r * 0.995)], seg=16, cap0=False, cap1=False)
        torno(M, 'liquido', [(h - 0.05, r * 0.42), (h - 0.05, 0.0001)], seg=10, cap0=False, cap1=False)
        M.anchor('tampo', 0, h, 0, r * 0.8, r * 0.8)
    return {'pithos': pithos, 'zir': zir, 'olla': olla}[style]

def jarros(style):
    def tres(M, w, d, h, prato=None):
        # (three jars of the pantry against the wall: tall, middling, short — their lids of wood, of reed, of clay)
        n = 3 if w > 0.8 else 2; r = min(d / 2 - 0.02, w / n / 2 - 0.015)
        for k in range(n):
            x = -w / 2 + w * (k + 0.5) / n; hh = h * (1.0, 0.82, 0.68)[k % 3]; rk = r * (0.95, 1.0, 0.9)[k % 3]
            pf = [(0.0, rk * 0.45), (0.04, rk * 0.75), (hh * 0.45, rk), (hh * 0.75, rk * 0.9), (hh - 0.07, rk * 0.55), (hh - 0.02, rk * 0.58), (hh, rk * 0.55)]
            torno(M, 'barro', pf, seg=14, x=x, sharp=60, cap1=False)
            cilindro(M, 'madeira' if k != 1 else 'palha', x, hh - 0.012, 0, rk * 0.58, 0.02, seg=12)
            M.anchor('tampo', x, hh + 0.01, 0, rk, rk)
    return {'tres': tres}[style]

# ------------------------------ o fogão de parede and the hearth on the floor ------------------------------
def fogao(style):
    def parede(M, w, d, h):
        # (the stove against the wall: a block of masonry with its fire-mouth, an iron plate or a stone on its top with a pot on it,
        # the hood over it from the mantel and the flue's anchor)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006
        caixa(M, 'reboco', (x0, 0, z0), (x1, h - 0.05, z1), ch=0.02, jit=0.004, seed=2700)
        pedra(M, 'pedra', (x0, h - 0.05, z0), (x1, h, z1), seed=2701, jit=0.002, ch=0.012)
        caixa(M, 'madeira2', (-0.22, 0.12, z1 - 0.004), (0.22, 0.42, z1 + 0.0), ch=0.0, grain='x')
        caixa(M, 'brasa', (-0.16, 0.14, z1 - 0.006), (0.16, 0.24, z1 - 0.002), ch=0.0, grain='x')
        torno(M, 'ferro', [(h, 0.15), (h + 0.01, 0.16), (h + 0.01, 0.0001)], seg=14, x=-0.25, z=0.0, cap0=False, cap1=False)
        torno(M, 'barro', [(h + 0.01, 0.06), (h + 0.03, 0.11), (h + 0.12, 0.13), (h + 0.18, 0.1), (h + 0.2, 0.105)], seg=12, x=-0.25, z=0.0, sharp=60, cap1=False)
        coifa(M, w, d, 1.45, 1.95, fw=0.44, fd=0.3)
        M.anchor('tampo', 0.3, h, 0.0, 0.4, d - 0.2)
    return {'parede': parede}[style]

def lar(style):
    def pedras(M, w, d, h):
        # (the hearth in the floor of the hall: a frame of stones, the ash and the embers in it, two logs across, a pot on a tripod;
        # the long one of the Norse hall — four metres of it — as the long hearth is made)
        if max(w, d) > 2.0:
            from moveis_fogo import fogo_comprido
            return fogo_comprido('lareira-longa')(M, w, d, h)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006; t = 0.12; k = 0
        for (a, b, c, e) in ((x0, z0, x1, z0 + t), (x0, z1 - t, x1, z1)):
            for i in range(2): pedra(M, 'pedra', (a + (c - a) * i / 2 + 0.005, 0, b), (a + (c - a) * (i + 1) / 2 - 0.005, h - 0.03 * ((i + k) % 2), e), seed=2800 + k * 3 + i, jit=0.01, ch=0.02)
            k += 1
        for (a, c) in ((x0, x0 + t), (x1 - t, x1)):
            for i in range(3): pedra(M, 'pedra', (a, 0, z0 + t + (z1 - z0 - 2 * t) * i / 3 + 0.005), (c, h - 0.03 * (i % 2), z0 + t + (z1 - z0 - 2 * t) * (i + 1) / 3 - 0.005), seed=2810 + i + (a > 0) * 5, jit=0.01, ch=0.02)
        brasas(M, 'reboco', x0 + t, x1 - t, z0 + t, z1 - t, 0.0, 0.05, seed=7, n=6)
        brasas(M, 'brasa', x0 + t + 0.06, x1 - t - 0.06, z0 + t + 0.1, z1 - t - 0.1, 0.03, 0.05, seed=8, n=6)
        lenha(M, -0.2, 0.2, 0.0, 0.05, n=2, r=0.04, seed=40)
        tripe_panela(M, 0.0, -0.25, 0.04, r=0.15)
        M.anchor('tampo', 0, h, 0.3, 0.3, 0.2)
    return {'pedras': pedras}[style]

# ------------------------------ a esteira (the sleeping mat) ------------------------------
def esteira(style):
    def junco(M, w, d, h, pele=False):
        # (a mat of woven reed on the floor, a hand thick, its edge bound; a rolled blanket — or a pelt — at its head)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006
        almofada(M, 'palha', (x0, 0.0, z0), (x1, h - 0.01, z1), e=0.12, nu=8, nv=4)
        if pele:
            lamina(M, 'couro', lambda u, v: (x0 + 0.04 + (x1 - x0 - 0.08) * u + 0.03 * math.sin(v * 9) * (u - 0.5), h + 0.004 + 0.006 * math.sin(u * 7 + v * 5), z0 + 0.35 + (z1 - z0 - 0.5) * v), 5, 6)
        else:
            n = 2 if w > 1.0 else 1
            for k in range(n):
                cx = 0 if n == 1 else (k - 0.5) * w / 2
                tubo(M, 'pano2', [(cx - min(0.28, w / n / 2 - 0.05), h + 0.045, z0 + 0.16), (cx + min(0.28, w / n / 2 - 0.05), h + 0.045, z0 + 0.16)], 0.055, seg=8, chao=None)
            lamina(M, 'pano', lambda u, v: (x0 + 0.03 + (x1 - x0 - 0.06) * u, h + 0.006 + 0.01 * math.sin(math.pi * u) * (1 - v), z1 - 0.7 + 0.66 * v), 6, 4)
        M.anchor('tampo', 0, h, 0, w - 0.1, d - 0.4)
    if style == 'pele': return lambda M, w, d, h: junco(M, w, d, h, pele=True)
    return {'junco': junco}[style]
