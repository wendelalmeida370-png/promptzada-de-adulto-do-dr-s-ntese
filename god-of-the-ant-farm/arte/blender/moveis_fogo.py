# moveis_fogo: the fires of the tavern, each people's own — the interiors 2.0, the front P2 (D-710): the hearth of the Roman, the
# Greek and the classical lands (1,40 × 0,60 × 1,20, its hood rising to the ceiling: the hood is the piece's, the flue over it a
# piece of its own — chamine — the 3D stretches from the hood's top to the ceiling there), the Egyptian's clay oven (1,00 × 1,00 ×
# 1,10), the Aztec's stove with its comal (1,20 × 0,70 × 0,60), the Norse long hearth in the middle of the hall (3,00 × 0,90 ×
# 0,30). The embers are their own part (brasa); the light is the world's (Build3D's FIRE_K, the piece's fire). The frame, the parts
# and the rules: moveis_pecas.py.
import math
from moveis_forma import (caixa, tabua, torno, cilindro, tubo, curva, arco_pts, lamina, almofada, ovo, pedra, brasas, tora,
                          bloco_arco, tronco, TAU)
from moveis_pecas import poste

def coifa(M, w, d, y0, top, part='reboco', borda='madeira', fw=0.5, fd=0.34):
    """the hood over a hearth: from the mantel's line at y0 (its front edge a moulded shelf, borda) narrowing to the flue's
    foot at the wall behind, at top; the flue's own piece (chamine) rises from there to the ceiling — its anchor"""
    x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.004, d / 2 - 0.006
    tabua(M, borda, (x0, y0, z1 - 0.07), (x1, y0 + 0.06, z1), ch=0.01, grain='x', seed=1301)
    tronco(M, part, (x0 + 0.03, z0, x1 - 0.03, z1 - 0.02), (-fw / 2, z0, fw / 2, z0 + fd), y0 + 0.06, top, faces='fed')
    M.anchor('chamine', 0, top, z0 + fd / 2, fw, fd)

def lenha(M, x0, x1, z, y, n=3, r=0.045, seed=0):
    """logs laid across a fire"""
    for k in range(n):
        zz = z + (k - (n - 1) / 2) * r * 2.1; tora(M, 'madeira2', (x0, y + r, zz), (x1, y + r * (1.4 if k == 1 else 1), zz + (0.04 if k == 1 else 0)), r, seg=7, seed=seed + k, cerne='madeira')

# ------------------------------ a lareira ------------------------------
def lareira(style):
    def focus(M, w, d, h):
        # (the Roman kitchen's raised hearth: masonry rendered, two arched niches under it where the wood is kept, a top of stone
        # with a kerb at the back and sides, the embers, a tripod with its pot; the hood over it from the mantel)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.004, d / 2 - 0.006; yt = 0.82
        for (a, b) in ((x0, 0.0), (0.0, x1)):
            bloco_arco(M, 'reboco', (a, 0, z0), (b, yt, z1), 0.42, 0.5, 0.42, seg=8, part_fundo='madeira2')
            cx = (a + b) / 2
            for k in range(3 if M.lod == 0 else 0): tora(M, 'madeira2', (cx - 0.17, 0.05 + k * 0.085 + (0.04 if k else 0), z1 - 0.36), (cx + 0.17, 0.05 + k * 0.085 + (0.04 if k else 0), z1 - 0.36 + 0.02 * k), 0.04, seg=6, seed=k, cerne='madeira')
        pedra(M, 'pedra', (x0, yt, z0), (x1, yt + 0.05, z1), seed=1310, jit=0.002, ch=0.012)
        for (a, b, c, e) in ((x0, z0, x1, z0 + 0.07), (x0, z0 + 0.07, x0 + 0.07, z1), (x1 - 0.07, z0 + 0.07, x1, z1)):
            pedra(M, 'pedra', (a, yt + 0.05, b), (c, yt + 0.12, e), seed=1311, jit=0.002, ch=0.01)
        brasas(M, 'brasa', x0 + 0.12, x1 - 0.12, z0 + 0.1, z1 - 0.1, yt + 0.05, 0.05, seed=1)
        tubo(M, 'ferro', [(0.18, yt + 0.11, -0.12), (0.5, yt + 0.11, -0.12)], 0.006, seg=4, chao=None)
        tubo(M, 'ferro', [(0.18, yt + 0.11, 0.08), (0.5, yt + 0.11, 0.08)], 0.006, seg=4, chao=None)
        for xx in (0.2, 0.3, 0.4, 0.48): tubo(M, 'ferro', [(xx, yt + 0.11, -0.12), (xx, yt + 0.11, 0.08)], 0.005, seg=4, chao=None)
        coifa(M, w, d, h, 1.85)
        M.anchor('tampo', 0.3, yt + 0.05, 0.12, 0.4, 0.12)
    def chamine(M, w, d, h):
        # (the fireplace of the classical lands: a hearth stone, the fireback, two jambs of stone, the lintel beam, the hood; the
        # andirons with their logs, the embers, a pot hung from a crane)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.004, d / 2 - 0.006; jw = 0.16
        pedra(M, 'pedra', (x0, 0, z0), (x1, 0.12, z1), seed=1320, jit=0.003, ch=0.015)
        caixa(M, 'reboco', (x0 + jw, 0.12, z0), (x1 - jw, h - 0.12, z0 + 0.1), ch=0.01, jit=0.004, seed=1321)
        for s in (-1, 1):
            a, b = (x0, x0 + jw) if s < 0 else (x1 - jw, x1)
            for k in range(4): pedra(M, 'pedra', (a, 0.12 + k * (h - 0.24) / 4, z0), (b, 0.12 + (k + 1) * (h - 0.24) / 4 - 0.006, z1 - 0.02), seed=1330 + k + s * 7, jit=0.004, ch=0.012)
        tabua(M, 'madeira2', (x0, h - 0.12, z0 + 0.1), (x1, h, z1 - 0.004), ch=0.012, grain='x', jit=0.004, seed=1340)
        for s in (-1, 1):
            x = s * 0.3
            tubo(M, 'ferro', [(x, 0.12, z1 - 0.12), (x, 0.32, z1 - 0.1)], 0.012, seg=5, chao=None)
            tubo(M, 'ferro', [(x, 0.17, z1 - 0.12), (x, 0.17, z0 + 0.14)], 0.01, seg=5, chao=None)
            ovo(M, 'ferro', x, 0.33, z1 - 0.1, 0.02, 0.02, seg=6)
        brasas(M, 'brasa', x0 + jw + 0.04, x1 - jw - 0.04, z0 + 0.12, z1 - 0.12, 0.12, 0.05, seed=2)
        lenha(M, -0.36, 0.36, -0.02, 0.17, n=3, r=0.045, seed=10)
        tubo(M, 'ferro', [(x1 - jw - 0.03, h - 0.15, z0 + 0.11), (-0.05, h - 0.15, z0 + 0.25)], 0.008, seg=4, chao=None)
        tubo(M, 'ferro', [(-0.05, h - 0.15, z0 + 0.25), (-0.05, 0.58, z0 + 0.25)], 0.004, seg=4, chao=None)
        torno(M, 'bronze', [(0.38, 0.03), (0.42, 0.11), (0.5, 0.13), (0.56, 0.12), (0.58, 0.115)], seg=14, x=-0.05, z=z0 + 0.25, sharp=60, cap1=False)
        coifa(M, w, d, h, 1.85, borda='madeira2')
    def eschara(M, w, d, h):
        # (the Greek's hearth: a low block of masonry with its fire tray of stone, a bronze tripod over the embers, the hood above)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.004, d / 2 - 0.006; yt = 0.5
        caixa(M, 'reboco', (x0 + 0.04, 0.06, z0), (x1 - 0.04, yt, z1 - 0.04), ch=0.015, jit=0.003, seed=1350)
        pedra(M, 'pedra', (x0, 0, z0), (x1, 0.06, z1), seed=1351, jit=0.002, ch=0.01)
        caixa(M, 'pintura', (x0 + 0.04, 0.32, z1 - 0.046), (x1 - 0.04, 0.38, z1 - 0.038), ch=0.002, grain='x')
        for (a, b, c, e) in ((x0, z0, x1, z0 + 0.08), (x0, z0, x0 + 0.08, z1), (x1 - 0.08, z0, x1, z1), (x0, z1 - 0.08, x1, z1)):
            pedra(M, 'pedra', (a, yt, b), (c, yt + 0.07, e), seed=1352, jit=0.002, ch=0.01)
        brasas(M, 'brasa', x0 + 0.1, x1 - 0.1, z0 + 0.1, z1 - 0.1, yt, 0.05, seed=3)
        lenha(M, -0.25, 0.25, 0.0, yt + 0.02, n=2, r=0.04, seed=20)
        coifa(M, w, d, h, 1.85, borda='pintura')
    return {'focus': focus, 'chamine': chamine, 'eschara': eschara}[style]

def chamine(style):
    def cano(M, w, d, h):
        # (the flue from the hood's top to the ceiling, against the wall: a unit's height — the 3D stretches it to the room's —,
        # rendered, a band of stone at its foot)
        caixa(M, 'reboco', (-w / 2 + 0.004, 0, -d / 2 + 0.004), (w / 2 - 0.004, h, d / 2 - 0.004), ch=0.012, top=False, bottom=False, grain='y')
    return {'cano': cano}[style]

# ------------------------------ o forno de barro (the Egyptian's) ------------------------------
def forno_barro(style):
    def colmeia(M, w, d, h):
        # (the beehive oven of mud on its block: the dome, its mouth under a short vault at the front with the fire in it, the vent
        # at its top, a wooden peel leant against it)
        hb = 0.32; R = min(w, d) / 2 - 0.03; x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006
        caixa(M, 'reboco', (x0, 0, z0), (x1, hb, z1), ch=0.03, jit=0.006, seed=1400)
        nv = 8
        pf = [(hb + (h - 0.03 - hb) * math.sin(math.pi / 2 * k / nv), R * math.cos(math.pi / 2 * k / nv) * (1.0 if k < nv else 0) + (0.07 if k == nv else 0)) for k in range(nv + 1)]
        torno(M, 'reboco', pf, seg=18, sharp=70, cap0=False, cap1=False)
        torno(M, 'pedra', [(h - 0.035, 0.07), (h - 0.01, 0.075), (h, 0.06), (h, 0.045), (h - 0.06, 0.04)], seg=10, cap0=False, cap1=False)
        cilindro(M, 'brasa', 0, h - 0.07, 0, 0.042, 0.01, seg=8, cap0=False)
        # (the mouth: a short vault out of the dome, an arch ring at its face, the glow of the fire inside)
        am, ah, zf = 0.17, 0.3, z1 - 0.04; ys = hb + ah - am
        lamina(M, 'reboco', lambda u, v: (-math.cos(math.pi * u) * (am + 0.04), ys + math.sin(math.pi * u) * (am + 0.04), 0.1 + (zf - 0.1) * v), 8, 2, uvs=(0.6, 0.3))
        for s in (-1, 1): caixa(M, 'reboco', (min(s * am, s * (am + 0.04)), hb, 0.1), (max(s * am, s * (am + 0.04)), ys, zf), ch=0.008)
        tubo(M, 'pedra', arco_pts((0, ys, zf), am + 0.02, 0, math.pi, 8), 0.025, seg=6, chao=None)
        for s in (-1, 1): tubo(M, 'pedra', [(s * (am + 0.02), hb, zf), (s * (am + 0.02), ys, zf)], 0.025, seg=6, chao=None)
        # (the glow of the fire at the back of the mouth: the arch's half disc and the square under it)
        lamina(M, 'brasa', lambda u, v: (-math.cos(math.pi * u) * am * (1 - v), ys + math.sin(math.pi * u) * am * (1 - v), 0.14), 8, 2)
        caixa(M, 'brasa', (-am, hb, 0.138), (am, ys, 0.142), ch=0.0)
        tubo(M, 'madeira', [(x1 - 0.06, 0.0, z1 - 0.1), (x1 - 0.1, 0.95, z1 - 0.3)], 0.014, seg=6)
        M.anchor('tampo', 0, hb, z1 - 0.06, w - 0.2, 0.08)
    return {'colmeia': colmeia}[style]

# ------------------------------ o fogão com o comal (the Aztec's) ------------------------------
def fogao_comal(style):
    def tlecuilli(M, w, d, h):
        # (a platform of stucco with its painted band; on it the three hearth stones, the embers between them and the comal of clay
        # on them; the olla at its back, the metate and its stone at its front)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006; hp = h - 0.18
        caixa(M, 'reboco', (x0, 0, z0), (x1, hp, z1), ch=0.025, jit=0.004, seed=1500)
        caixa(M, 'pintura', (x0 + 0.03, hp - 0.12, z1 - 0.002), (x1 - 0.03, hp - 0.06, z1 + 0.0), ch=0.002, grain='x')
        cx, cz = x0 + 0.33, 0.0
        for k in range(3):
            a = k * TAU / 3 + 0.3; ovo(M, 'pedra', cx + math.cos(a) * 0.17, hp + 0.055, cz + math.sin(a) * 0.17, 0.06, 0.06, 0.05, seg=8, nv=4)
        brasas(M, 'brasa', cx - 0.15, cx + 0.15, cz - 0.15, cz + 0.15, hp, 0.04, seed=4, n=6)
        torno(M, 'barro', [(hp + 0.11, 0.255), (hp + 0.118, 0.255), (hp + 0.124, 0.22), (hp + 0.128, 0.0001)], seg=24, x=cx, z=cz, sharp=60, cap0=True, cap1=False)
        ox = x1 - 0.2
        torno(M, 'barro', [(hp, 0.06), (hp + 0.02, 0.1), (hp + 0.09, 0.14), (hp + 0.17, 0.12), (hp + 0.2, 0.08), (hp + 0.22, 0.09)], seg=14, x=ox, z=z0 + 0.16, sharp=60, cap1=False)
        torno(M, 'liquido', [(hp + 0.2, 0.08), (hp + 0.2, 0.0001)], seg=10, x=ox, z=z0 + 0.16, cap0=False, cap1=False)
        caixa(M, 'pedra', (ox - 0.13, hp, z1 - 0.22), (ox + 0.13, hp + 0.06, z1 - 0.04), ch=0.015, jit=0.005, seed=1510)
        tubo(M, 'pedra', [(ox - 0.11, hp + 0.08, z1 - 0.13), (ox + 0.11, hp + 0.08, z1 - 0.13)], 0.022, seg=7, chao=None)
        M.anchor('tampo', cx, hp + 0.128, cz, 0.3, 0.3)
    return {'tlecuilli': tlecuilli}[style]

# ------------------------------ o fogo comprido (the Norse long hearth, in the middle of the hall) ------------------------------
def fogo_comprido(style):
    def lareira_longa(M, w, d, h):
        # (a long hearth lined with stones set on edge, earth and ash between them, the embers along its middle, logs on them, a
        # tripod with its pot at one end, a flat stone for the bread at the other)
        x0, x1, z0, z1 = -w / 2 + 0.006, w / 2 - 0.006, -d / 2 + 0.006, d / 2 - 0.006; t = 0.13
        n = 9 if M.lod == 0 else 5; k = 0
        for s in (-1, 1):
            for i in range(n):
                a = x0 + (x1 - x0) * i / n + 0.006; b = x0 + (x1 - x0) * (i + 1) / n - 0.006
                zz = (z1 - t, z1) if s > 0 else (z0, z0 + t)
                pedra(M, 'pedra', (a, 0, zz[0]), (b, h - 0.07 + 0.07 * ((i * 7 + k) % 3) / 2, zz[1]), seed=1600 + k, jit=0.012, ch=0.025); k += 1
        for s in (-1, 1):
            xx = (x1 - t, x1) if s > 0 else (x0, x0 + t)
            for i in range(3):
                a = z0 + t + (z1 - z0 - 2 * t) * i / 3 + 0.006; b = z0 + t + (z1 - z0 - 2 * t) * (i + 1) / 3 - 0.006
                pedra(M, 'pedra', (xx[0], 0, a), (xx[1], h - 0.05, b), seed=1650 + i + s, jit=0.012, ch=0.025)
        brasas(M, 'reboco', x0 + t, x1 - t, z0 + t, z1 - t, 0.0, 0.07, seed=5, n=10)
        brasas(M, 'brasa', -0.75, 0.75, z0 + t + 0.04, z1 - t - 0.04, 0.05, 0.06, seed=6, n=10)
        for i in range(3):
            xa = -0.6 + i * 0.45; tora(M, 'madeira2', (xa, 0.1, -0.2), (xa + 0.3, 0.13, 0.18), 0.05, seg=7, seed=30 + i, cerne='madeira')
        pedra(M, 'pedra', (x0 + 0.2, 0.06, -0.22), (x0 + 0.62, 0.13, 0.2), seed=1700, jit=0.006, ch=0.02)
        M.anchor('tampo', x0 + 0.41, 0.13, 0, 0.36, 0.36)
    return {'lareira-longa': lareira_longa}[style]
