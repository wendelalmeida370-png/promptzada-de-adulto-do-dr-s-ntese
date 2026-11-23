# moveis_bar: the counter and what keeps the drink — the interiors 2.0, the front P2 (D-710): the counter against the wall
# (1,80 × 0,60 × 1,00; the customer before it at +z, the keeper behind it), the Roman's masonry counter in an L with its jars set
# in it (2,40 × 1,60 × 1,00, the thermopolium, its front to the street), the shelves of the bar behind the keeper (1,80 × 0,40 ×
# 1,90), the rack of the pointed amphorae (1,20 × 0,50 × 1,10) and the amphora itself (what the rack shows: one in each place the
# tavern's store fills), the cask (0,60 Ø × 0,90), the brewing vat (1,00 × 1,00 × 1,10), the casks racked on their cradle (1,40 ×
# 0,80 × 1,00). Where a people had no casks (the Egyptian, the Aztec), its jars of clay in their place. The frame, the parts and the
# rules: moveis_pecas.py.
import math
from mathutils import Matrix
from moveis_forma import (caixa, tabua, tampo, torno, cilindro, tubo, curva, lamina, almofada, ovo, pedra, aduelas, aros,
                          fundo_tabuas, TAU)
from moveis_pecas import poste, quatro, travessas, tampo_redondo

def papiro_coluna(M, part, x, z, y0, y1, r, faixa='pintura'):
    """a post shaped as a bundle of papyrus stems bound at its top and foot, its capital opening a little (the Egyptian's)"""
    H = y1 - y0
    torno(M, part, [(y0, r * 0.9), (y0 + 0.02, r * 1.05), (y0 + H * 0.12, r * 0.95), (y0 + H * 0.7, r * 0.86), (y0 + H * 0.82, r * 0.8), (y0 + H * 0.9, r * 1.15), (y1, r * 1.25)], seg=12 if M.lod == 0 else 6, x=x, z=z, sharp=40)
    for yy in (y0 + H * 0.74, y0 + H * 0.78):
        torno(M, faixa, [(yy, r * 0.86), (yy + 0.008, r * 0.92), (yy + 0.016, r * 0.86)], seg=12, x=x, z=z, cap0=False, cap1=False)

# ------------------------------ o balcão (against the wall: the customer at +z, the keeper behind) ------------------------------
def balcao(style):
    def painel(M, w, d, h, pintado=False):
        # (the framed counter: a plinth, the front of three panels in their frame, the ends panelled, a thick top of two boards, the
        # keeper's shelves inside — the classical and the Roman; the Greek's panels painted)
        zf = d / 2 - 0.004; pan = 'pintura' if pintado else 'madeira'
        caixa(M, 'madeira2', (-w / 2 + 0.03, 0, -d / 2 + 0.05), (w / 2 - 0.03, 0.09, zf - 0.03), ch=0.01, grain='x')
        xs = [-w / 2 + 0.004, -w / 6, w / 6, w / 2 - 0.004]
        for i, x in enumerate(xs):
            a = x if i == 0 else x - 0.065 if i == 3 else x - 0.03; b = a + (0.065 if i in (0, 3) else 0.06)
            tabua(M, 'madeira', (a, 0.09, zf - 0.05), (b, h - 0.05, zf), grain='y', seed=100 + i)
        for y0, y1 in ((0.09, 0.19), (h - 0.15, h - 0.05)): tabua(M, 'madeira', (-w / 2 + 0.06, y0, zf - 0.045), (w / 2 - 0.06, y1, zf - 0.005), grain='x', seed=110)
        for i in range(3):
            a = xs[i] + (0.065 if i == 0 else 0.03); b = xs[i + 1] - (0.065 if i == 2 else 0.03)
            tabua(M, pan, (a, 0.19, zf - 0.04), (b, h - 0.15, zf - 0.025), ch=0.012, grain='y', seed=120 + i)
        for s in (-1, 1):
            x0, x1 = (w / 2 - 0.05, w / 2 - 0.004) if s > 0 else (-w / 2 + 0.004, -w / 2 + 0.05)
            tabua(M, 'madeira', (x0, 0.09, -d / 2 + 0.04), (x1, h - 0.05, zf - 0.05), grain='y', seed=130 + s)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, zf, h - 0.05, h, 2, along='x', gap=0.004, ch=0.012, seed=140)
        for y in (0.42, 0.13): tabua(M, 'madeira2', (-w / 2 + 0.05, y, -d / 2 + 0.06), (w / 2 - 0.05, y + 0.025, zf - 0.05), grain='x', seed=150)
        M.anchor('tampo', 0, h, 0.02, w - 0.12, d - 0.1); M.anchor('prateleira', 0, 0.445, -0.04, w - 0.12, d - 0.16)
    def tabuas(M, w, d, h):
        # (the Norse counter: its front of upright planks strapped with iron, posts at its corners, a heavy top slab)
        zf = d / 2 - 0.004; n = 8 if M.lod == 0 else 3
        for i in range(n):
            a = -w / 2 + 0.07 + (w - 0.14) * i / n; b = -w / 2 + 0.07 + (w - 0.14) * (i + 1) / n - 0.006
            tabua(M, 'madeira', (a, 0.0, zf - 0.035), (b, h - 0.06, zf - 0.005), grain='y', seed=200 + i, jit=0.003)
        for sx in (-1, 1):
            for sz in (-1, 1): caixa(M, 'madeira2', (sx * (w / 2 - 0.004) - (0.08 if sx > 0 else 0), 0, sz * (d / 2 - 0.004) - (0.08 if sz > 0 else 0)), (sx * (w / 2 - 0.004) + (0.08 if sx < 0 else 0), h - 0.06, sz * (d / 2 - 0.004) + (0.08 if sz < 0 else 0)), ch=0.01, grain='y', jit=0.003, seed=210)
            tabua(M, 'madeira', ((w / 2 - 0.035) * sx - 0.015, 0, -d / 2 + 0.08), ((w / 2 - 0.035) * sx + 0.015, h - 0.06, zf - 0.04), grain='y', seed=215)
        for y in (0.22, h - 0.25):
            caixa(M, 'ferro', (-w / 2 + 0.08, y, zf - 0.004), (w / 2 - 0.08, y + 0.04, zf), ch=0.002, grain='x')
            if M.lod == 0:
                for i in range(n): ovo(M, 'ferro', -w / 2 + 0.07 + (w - 0.14) * (i + 0.5) / n, y + 0.02, zf - 0.004, 0.008, 0.008, seg=5, nv=3)
        tabua(M, 'madeira', (-w / 2 + 0.004, h - 0.06, -d / 2 + 0.004), (w / 2 - 0.004, h, zf), ch=0.014, grain='x', seed=220, jit=0.004)
        tabua(M, 'madeira2', (-w / 2 + 0.09, 0.45, -d / 2 + 0.09), (w / 2 - 0.09, 0.48, zf - 0.04), grain='x', seed=225)
        M.anchor('tampo', 0, h, 0.0, w - 0.12, d - 0.1); M.anchor('prateleira', 0, 0.48, -0.03, w - 0.2, d - 0.16)
    def egipcio(M, w, d, h):
        # (the Egyptian counter: a frame of light wood, its front panels painted, a papyrus column at each front corner)
        zf = d / 2 - 0.004
        for s in (-1, 1): papiro_coluna(M, 'madeira', s * (w / 2 - 0.045), zf - 0.045, 0, h - 0.04, 0.035)
        tabua(M, 'madeira2', (-w / 2 + 0.09, 0, zf - 0.06), (w / 2 - 0.09, 0.08, zf - 0.02), grain='x', seed=300)
        for i in range(3):
            a = -w / 2 + 0.09 + (w - 0.18) * i / 3 + 0.01; b = -w / 2 + 0.09 + (w - 0.18) * (i + 1) / 3 - 0.01
            tabua(M, 'pintura' if i % 2 == 0 else 'madeira', (a, 0.08, zf - 0.05), (b, h - 0.08, zf - 0.02), grain='y', seed=310 + i)
        for s in (-1, 1):
            a, b = sorted((s * (w / 2 - 0.004), s * (w / 2 - 0.044)))
            tabua(M, 'madeira', (a, 0, -d / 2 + 0.04), (b, h - 0.04, zf - 0.09), grain='y', seed=320)
        tabua(M, 'madeira', (-w / 2 + 0.004, h - 0.04, -d / 2 + 0.004), (w / 2 - 0.004, h, zf), ch=0.01, grain='x', seed=330)
        tabua(M, 'pintura', (-w / 2 + 0.09, h - 0.08, zf - 0.02), (w / 2 - 0.09, h - 0.04, zf - 0.004), ch=0.003, grain='x', seed=331)
        tabua(M, 'madeira2', (-w / 2 + 0.06, 0.42, -d / 2 + 0.06), (w / 2 - 0.06, 0.445, zf - 0.07), grain='x', seed=332)
        M.anchor('tampo', 0, h, 0.0, w - 0.14, d - 0.1); M.anchor('prateleira', 0, 0.445, -0.04, w - 0.14, d - 0.18)
    def asteca(M, w, d, h):
        # (the Aztec counter: walls of plastered masonry open behind, a painted band along its front, a top of wood)
        zf = d / 2 - 0.004
        caixa(M, 'reboco', (-w / 2 + 0.004, 0, zf - 0.13), (w / 2 - 0.004, h - 0.05, zf), ch=0.02, jit=0.003, seed=400)
        for s in (-1, 1): caixa(M, 'reboco', (s * (w / 2 - 0.004) - (0.13 if s > 0 else 0), 0, -d / 2 + 0.03), (s * (w / 2 - 0.004) + (0.13 if s < 0 else 0), h - 0.05, zf - 0.12), ch=0.02, jit=0.003, seed=401 + s)
        caixa(M, 'pintura', (-w / 2 + 0.03, 0.72, zf - 0.006), (w / 2 - 0.03, 0.82, zf + 0.0), ch=0.002, grain='x')
        caixa(M, 'pintura', (-w / 2 + 0.03, 0.06, zf - 0.006), (w / 2 - 0.03, 0.1, zf + 0.0), ch=0.002, grain='x')
        tabua(M, 'madeira', (-w / 2 + 0.004, h - 0.05, -d / 2 + 0.004), (w / 2 - 0.004, h, zf), ch=0.012, grain='x', seed=410)
        caixa(M, 'reboco', (-w / 2 + 0.13, 0, -d / 2 + 0.06), (w / 2 - 0.13, 0.4, zf - 0.13), ch=0.015, seed=411)
        M.anchor('tampo', 0, h, 0.0, w - 0.12, d - 0.1); M.anchor('prateleira', 0, 0.4, -0.06, w - 0.3, d - 0.3)
    if style == 'grego': return lambda M, w, d, h: painel(M, w, d, h, pintado=True)
    return {'painel': painel, 'tabuas': tabuas, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ o balcão de alvenaria (the thermopolium: an L, its front to the street) ------------------------------
def balcao_alvenaria(style):
    def termopolio(M, w, d, h):
        # (the long arm along the front, the short arm down the left side to the back; the keeper inside the L. Masonry rendered
        # and painted in panels, a skirting, a top of stone, the mouths of the jars set in it — one with its lid —, and the stepped
        # shelf at the back of the short arm where the cups stood)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004
        fd = 0.6; sw = 0.6; tp = 0.05
        A = (x0, z1 - fd, x1, z1)               # the front arm
        B = (x0, z0, x0 + sw, z1 - fd)          # the side arm
        for (a, b, c, e), sd in ((A, 501), (B, 502)):
            caixa(M, 'reboco', (a + 0.012, 0.08, b + (0.012 if sd == 502 else 0.0)), (c - 0.012, h - tp, e - 0.012), ch=0.015, jit=0.002, seed=sd)
            caixa(M, 'pedra', (a, 0, b + (0.0 if sd == 502 else 0.012)), (c, 0.08, e), ch=0.012, seed=sd + 10)
        # (the painted panels on the faces the street and the room see: the front, the left end, the side arm's outer face)
        n = 3
        for i in range(n):
            a = x0 + 0.1 + (x1 - x0 - 0.2) * i / n + 0.03; b = x0 + 0.1 + (x1 - x0 - 0.2) * (i + 1) / n - 0.03
            caixa(M, 'pintura', (a, 0.2, z1 - 0.0125), (b, h - tp - 0.14, z1 - 0.008), ch=0.002, grain='x')
        for (za, zb) in ((z0 + 0.1, z1 - fd - 0.05), (z1 - fd + 0.08, z1 - 0.1)):
            caixa(M, 'pintura', (x0 + 0.008, 0.2, za), (x0 + 0.0125, h - tp - 0.14, zb), ch=0.002, grain='z')
        # (the stone top over both arms, a hair proud of the rendered masonry)
        for (a, b, c, e), sd in ((A, 520), (B, 521)): pedra(M, 'pedra', (a, h - tp, b), (c, h, e), seed=sd, jit=0.002, ch=0.012)
        # (the jars set in the top: three along the front, one in the side arm; the last with a wooden lid)
        jars = [(x0 + sw + (x1 - x0 - sw) * k / 3 - 0.02, z1 - fd / 2) for k in (0.5, 1.5, 2.5)] + [(x0 + sw / 2, z0 + 0.45)]
        for k, (x, z) in enumerate(jars):
            torno(M, 'barro', [(h - 0.002, 0.13), (h + 0.012, 0.135), (h + 0.02, 0.15), (h + 0.012, 0.168), (h - 0.002, 0.17)], seg=20, x=x, z=z, cap0=False, cap1=False, sharp=60)
            if k == 3:
                cilindro(M, 'madeira', x, h + 0.012, z, 0.155, 0.025, seg=18); ovo(M, 'madeira2', x, h + 0.055, z, 0.03, 0.022, seg=8)
            else: cilindro(M, 'liquido', x, h - 0.05, z, 0.132, 0.03, seg=18, cap0=False)
        # (the stepped shelf at the back of the side arm)
        for k in range(3):
            ya = h + k * 0.11; zb = z0 + 0.36 - k * 0.11
            caixa(M, 'reboco', (x0 + 0.02, ya, z0 + 0.01), (x0 + sw - 0.02, ya + 0.11, zb), ch=0.012, seed=530 + k)
            pedra(M, 'pedra', (x0 + 0.015, ya + 0.1, z0 + 0.006), (x0 + sw - 0.015, ya + 0.12, zb + 0.015), seed=540 + k, jit=0.001, ch=0.006)
            M.anchor('prateleira', x0 + sw / 2, ya + 0.12, (z0 + zb) / 2 + 0.05, sw - 0.06, 0.1)
        M.anchor('tampo', (x0 + sw + x1) / 2, h, z1 - fd / 2 + 0.18, x1 - x0 - sw - 0.2, 0.18)
    return {'termopolio': termopolio}[style]

# ------------------------------ a prateleira do bar (against the wall behind the keeper) ------------------------------
def prateleira_bar(style):
    def estante(M, w, d, h, pintado=False):
        # (the classical shelves: two sides, a plinth, three shelves, a cornice — the Greek's painted —, pegs under the top board)
        zb, zf = -d / 2 + 0.004, d / 2 - 0.004
        for s in (-1, 1): tabua(M, 'madeira', (s * (w / 2 - 0.004) - (0.03 if s > 0 else 0), 0, zb), (s * (w / 2 - 0.004) + (0.03 if s < 0 else 0), h - 0.07, zf - 0.02), grain='y', seed=600 + s)
        caixa(M, 'madeira2', (-w / 2 + 0.03, 0, zb + 0.02), (w / 2 - 0.03, 0.09, zf - 0.04), ch=0.008, grain='x')
        ys = [0.09, 0.62, 1.12, 1.6]
        for i, y in enumerate(ys):
            tabua(M, 'madeira', (-w / 2 + 0.034, y, zb + 0.01), (w / 2 - 0.034, y + 0.03, zf - 0.025), grain='x', seed=610 + i)
            M.anchor('prateleira', 0, y + 0.03, -0.01, w - 0.12, d - 0.1)
        caixa(M, 'pintura' if pintado else 'madeira', (-w / 2 + 0.004, h - 0.07, zb), (w / 2 - 0.004, h - 0.03, zf), ch=0.01, grain='x')
        caixa(M, 'madeira2', (-w / 2 + 0.02, h - 0.03, zb), (w / 2 - 0.02, h, zf - 0.015), ch=0.008, grain='x')
        tabua(M, 'madeira2', (-w / 2 + 0.034, 1.5, zb), (w / 2 - 0.034, 1.56, zb + 0.022), grain='x', seed=620)
        n = 6
        for i in range(n):
            x = -w / 2 + 0.15 + (w - 0.3) * i / (n - 1)
            tubo(M, 'madeira2', [(x, 1.53, zb + 0.02), (x, 1.545, zb + 0.09)], 0.009, seg=5)
            M.anchor('gancho', x, 1.52, zb + 0.08, 0.05, 0.05)
    def nordico(M, w, d, h):
        # (the Norse shelves: two battens against the wall, rough planks on knee-braces, pegs along a rail)
        zb, zf = -d / 2 + 0.004, d / 2 - 0.004
        for s in (-1, 1):
            x = s * (w / 2 - 0.18)
            tabua(M, 'madeira2', (x - 0.04, 0, zb), (x + 0.04, h, zb + 0.05), grain='y', seed=700 + s, jit=0.003)
        for i, y in enumerate((0.5, 1.0, 1.48, h - 0.045)):
            tabua(M, 'madeira', (-w / 2 + 0.004, y, zb + 0.05), (w / 2 - 0.004, y + 0.04, zf), grain='x', seed=710 + i, jit=0.003)
            M.anchor('prateleira', 0, y + 0.04, 0.02, w - 0.1, d - 0.1)
            if y < h - 0.1:
                for s in (-1, 1):
                    x = s * (w / 2 - 0.18); tubo(M, 'madeira2', [(x, y - 0.2, zb + 0.05), (x, y - 0.01, zf - 0.04)], 0.016, seg=5, chao=None)
        tabua(M, 'madeira2', (-w / 2 + 0.1, 0.28, zb), (w / 2 - 0.1, 0.33, zb + 0.03), grain='x', seed=720)
        for i in range(5):
            x = -w / 2 + 0.3 + (w - 0.6) * i / 4; tubo(M, 'madeira2', [(x, 0.3, zb + 0.03), (x, 0.31, zb + 0.1)], 0.01, seg=5); M.anchor('gancho', x, 0.3, zb + 0.09, 0.05, 0.05)
    def egipcio(M, w, d, h):
        # (the Egyptian shelves: four papyrus posts, the shelves between them, a painted cornice)
        zb, zf = -d / 2 + 0.004, d / 2 - 0.004
        for sx in (-1, 1):
            for sz, zz in ((-1, zb + 0.035), (1, zf - 0.035)): papiro_coluna(M, 'madeira', sx * (w / 2 - 0.04), zz, 0, h - 0.06, 0.03)
        for i, y in enumerate((0.1, 0.62, 1.12, 1.6)):
            tabua(M, 'madeira', (-w / 2 + 0.075, y, zb + 0.004), (w / 2 - 0.075, y + 0.028, zf - 0.004), grain='x', seed=800 + i)
            M.anchor('prateleira', 0, y + 0.028, 0, w - 0.18, d - 0.06)
        caixa(M, 'pintura', (-w / 2 + 0.004, h - 0.06, zb), (w / 2 - 0.004, h, zf), ch=0.008, grain='x')
    def asteca(M, w, d, h):
        # (the Aztec shelves: square posts and boards, the boards' fronts painted)
        zb, zf = -d / 2 + 0.004, d / 2 - 0.004
        for sx in (-1, 1):
            for zz in (zb + 0.03, zf - 0.03): caixa(M, 'madeira2', (sx * (w / 2 - 0.004) - (0.06 if sx > 0 else 0), 0, zz - 0.03), (sx * (w / 2 - 0.004) + (0.06 if sx < 0 else 0), h, zz + 0.03), ch=0.01, grain='y')
        for i, y in enumerate((0.08, 0.6, 1.1, 1.58, h - 0.04)):
            tabua(M, 'madeira', (-w / 2 + 0.064, y, zb + 0.004), (w / 2 - 0.064, y + 0.035, zf - 0.016), grain='x', seed=900 + i)
            caixa(M, 'pintura', (-w / 2 + 0.064, y, zf - 0.016), (w / 2 - 0.064, y + 0.035, zf - 0.004), ch=0.003, grain='x')
            M.anchor('prateleira', 0, y + 0.035, 0, w - 0.16, d - 0.06)
    if style == 'grego': return lambda M, w, d, h: estante(M, w, d, h, pintado=True)
    return {'estante': estante, 'nordico': nordico, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ a anforeira and the amphora ------------------------------
SLOTS_ANFORA = 3
def anforeira(style):
    def suporte(M, w, d, h, pintado=True, palha=False):
        # (the rack of the pointed amphorae: two end frames, a top board with a ring for each amphora's body, a low board with a
        # cup for each one's point; the amphorae are the tavern's — the rack shows one in each place its store fills: anchors)
        zb, zf = -d / 2 + 0.004, d / 2 - 0.004; n = SLOTS_ANFORA
        for s in (-1, 1):
            x = s * (w / 2 - 0.03)
            for zz in (zb + 0.03, zf - 0.03): poste(M, 'madeira', x, zz, 0, 0.86, 0.05, 0.05)
            for y in (0.05, 0.78): tabua(M, 'madeira2', (x - 0.022, y, zb + 0.004), (x + 0.022, y + 0.05, zf - 0.004), grain='z', seed=1000 + s)
        xs = [-w / 2 + w * (k + 0.5) / n for k in range(n)]
        for zz in (zb + 0.03, zf - 0.03):
            tabua(M, 'pintura' if pintado else 'madeira2', (-w / 2 + 0.055, 0.8, zz - 0.022), (w / 2 - 0.055, 0.84, zz + 0.022), grain='x', seed=1010)
            tabua(M, 'madeira2', (-w / 2 + 0.055, 0.07, zz - 0.02), (w / 2 - 0.055, 0.1, zz + 0.02), grain='x', seed=1011)
        for x in xs:
            torno(M, 'palha' if palha else 'madeira', [(0.78, 0.16), (0.8, 0.168), (0.84, 0.168), (0.86, 0.16), (0.86, 0.14), (0.78, 0.14)], seg=16, x=x, cap0=False, cap1=False, sharp=40)
            torno(M, 'madeira', [(0.06, 0.06), (0.1, 0.065), (0.11, 0.055), (0.11, 0.035), (0.06, 0.03)], seg=10, x=x, cap0=False, cap1=False)
            tabua(M, 'madeira2', (x - 0.02, 0.07, zb + 0.05), (x + 0.02, 0.1, zf - 0.05), grain='z', seed=1020)
            M.anchor('nicho', x, 0.1, 0, 0.3, 0.3)
    if style == 'asteca': return lambda M, w, d, h: suporte(M, w, d, h, palha=True)
    return {'suporte': suporte}[style]

def anfora(style):
    # (one amphora, its point at y = 0 — the rack puts it in its cup —: the long body of a transport amphora, the shoulder, the
    # neck and its two handles; the Egyptian's wine jar slimmer, its handles small; the Aztec's a round-bottomed jar of the
    # same reach, its lip turned out)
    def classica(M, w, d, h):
        r = 0.15; pf = [(0.0, 0.012), (0.02, 0.022), (0.06, 0.03), (0.14, 0.09), (0.3, 0.135), (0.5, r), (0.64, 0.148), (0.72, 0.12), (0.76, 0.06), (0.78, 0.05), (0.98, 0.046), (1.0, 0.056), (1.03, 0.058), (1.04, 0.05)]
        torno(M, 'barro', [(y * h, rr) for y, rr in pf], seg=16, sharp=60, cap0=True, cap1=False)
        torno(M, 'liquido', [(h * 1.035, 0.046), (h * 1.035, 0.0001)], seg=10, cap0=False, cap1=False)
        for s in (-1, 1): tubo(M, 'barro', curva([(s * 0.05, 0.96 * h, 0), (s * 0.12, 0.94 * h, 0), (s * 0.13, 0.84 * h, 0), (s * 0.11, 0.73 * h, 0)], 6), 0.014, seg=6, oval=0.6)
    def egipcia(M, w, d, h):
        pf = [(0.0, 0.01), (0.04, 0.03), (0.2, 0.1), (0.45, 0.128), (0.62, 0.13), (0.74, 0.11), (0.8, 0.07), (0.88, 0.05), (0.97, 0.05), (1.0, 0.06), (1.02, 0.05)]
        torno(M, 'barro', [(y * h, rr) for y, rr in pf], seg=16, sharp=60, cap1=False)
        for s in (-1, 1): tubo(M, 'barro', curva([(s * 0.1, 0.78 * h, 0), (s * 0.14, 0.74 * h, 0), (s * 0.128, 0.68 * h, 0)], 5), 0.011, seg=5, oval=0.6)
        cilindro(M, 'reboco', 0, 0.96 * h, 0, 0.056, 0.07 * h, seg=10)
    def olla(M, w, d, h):
        pf = [(0.0, 0.03), (0.05, 0.08), (0.2, 0.135), (0.45, 0.148), (0.62, 0.13), (0.76, 0.085), (0.84, 0.07), (0.92, 0.075), (0.98, 0.095), (1.0, 0.09)]
        torno(M, 'barro', [(0.02 + y * (h - 0.02), rr) for y, rr in pf], seg=16, sharp=60, cap1=False)
        torno(M, 'pintura', [(0.5 * h, 0.146), (0.52 * h, 0.148), (0.54 * h, 0.144)], seg=16, cap0=False, cap1=False)
        torno(M, 'liquido', [(0.97 * h, 0.08), (0.97 * h, 0.0001)], seg=10, cap0=False, cap1=False)
    return {'classica': classica, 'egipcia': egipcia, 'olla': olla}[style]

# ------------------------------ the cask, the vat, the casks on their cradle ------------------------------
def barril(style):
    def aduelado(M, w, d, h):
        # (the cask of staves standing: its bulge, its hoops — of iron, of bronze or of withies, by what the people has (the part
        # ferro) —, its head of three boards set below the staves' ends, a wooden tap near its foot)
        rm = min(w, d) / 2 - 0.045; re = rm - 0.038
        raio = lambda y: re + (rm - re) * math.sin(math.pi * max(0.0, min(1.0, y / h))) ** 0.75
        aduelas(M, 'madeira', h, raio, n=16, t=0.022, chime=0.025)
        aros(M, 'ferro', h, raio, [0.06, 0.2, h - 0.2, h - 0.06], larg=0.035, esp=0.005)
        fundo_tabuas(M, 'madeira2', re - 0.02, h - 0.025, n=3)
        tubo(M, 'madeira2', [(0, 0.16, raio(0.16) - 0.01), (0, 0.155, raio(0.16) + 0.04)], 0.016, seg=7)
        tubo(M, 'madeira', [(0, 0.155, raio(0.16) + 0.032), (0, 0.19, raio(0.16) + 0.032)], 0.007, seg=5)
        M.anchor('tampo', 0, h - 0.025, 0, (re - 0.03) * 1.4, (re - 0.03) * 1.4)
    def jarra(M, w, d, h):
        # (the great jar of clay on its ring stand of wood, a wooden lid on its mouth — the Egyptian's and the Aztec's store)
        r = min(w, d) / 2 - 0.02; hs = 0.12
        torno(M, 'madeira', [(0.0, r * 0.62), (0.03, r * 0.66), (hs - 0.02, r * 0.62), (hs, r * 0.55), (hs, r * 0.45), (0.0, r * 0.45)], seg=16, cap0=False, cap1=False, sharp=40)
        pf = [(hs - 0.06, 0.05), (hs - 0.04, 0.16), (hs + 0.08, r * 0.86), (hs + 0.3, r), (hs + 0.5, r * 0.97), (h - 0.16, r * 0.66), (h - 0.08, r * 0.45), (h - 0.04, r * 0.46), (h - 0.01, r * 0.5), (h - 0.004, r * 0.47)]
        torno(M, 'barro', pf, seg=18, sharp=60, cap1=False)
        cilindro(M, 'madeira', 0, h - 0.014, 0, r * 0.5, 0.02, seg=16); ovo(M, 'madeira2', 0, h + 0.016, 0, 0.025, 0.018, seg=8)
        M.anchor('tampo', 0, h + 0.006, 0, r * 0.7, r * 0.7)
    return {'aduelado': aduelado, 'jarra': jarra}[style]

def cuba(style):
    def aduelada(M, w, d, h):
        # (the brewing vat: an open tub of staves narrowing to its mouth, hooped; the brew in it, a paddle left in it)
        rb, rt = min(w, d) / 2 - 0.012, min(w, d) / 2 - 0.05; H = h - 0.06
        raio = lambda y: rb + (rt - rb) * (y / H)
        aduelas(M, 'madeira', H, raio, n=20, t=0.03, aberto=True, part_dentro='madeira2', rings=4)
        aros(M, 'ferro', H, raio, [0.08, 0.38, H - 0.3, H - 0.08], larg=0.04, esp=0.006, seg=32)
        torno(M, 'liquido', [(H - 0.14, raio(H - 0.14) - 0.03), (H - 0.14, 0.0001)], seg=24, cap0=False, cap1=False)
        tubo(M, 'madeira', [(0.08, H - 0.3, -0.1), (0.2, h + 0.0, 0.2)], 0.016, seg=6)
        caixa(M, 'madeira', (0.03, H - 0.4, -0.18), (0.11, H - 0.18, -0.12), ch=0.008, grain='y')
        M.anchor('tampo', 0, H, 0, 0.1, 0.1)
    def barro(M, w, d, h):
        # (the vat of clay: thick walls, a rolled rim, the brew in it, a ladle hung on its lip)
        r = min(w, d) / 2 - 0.012; H = h - 0.08
        torno(M, 'barro', [(0.0, r * 0.7), (0.06, r * 0.85), (0.3, r), (H - 0.2, r * 0.97), (H - 0.06, r * 0.9), (H, r * 0.92), (H + 0.03, r * 0.95), (H + 0.035, r * 0.88), (H - 0.04, r * 0.84), (0.25, r * 0.86)], seg=24, sharp=60, cap0=True, cap1=False)
        torno(M, 'liquido', [(H - 0.16, r * 0.85), (H - 0.16, 0.0001)], seg=20, cap0=False, cap1=False)
        tubo(M, 'madeira', curva([(r * 0.6, H - 0.12, 0), (r * 0.86, H + 0.06, 0), (r * 0.94, H + 0.02, 0)], 5), 0.01, seg=5)
        M.anchor('tampo', 0, H, 0, 0.1, 0.1)
    return {'aduelada': aduelada, 'barro': barro}[style]

def pipas(style):
    def berco(M, w, d, h):
        # (two casks lying side by side on a cradle of two beams with their saddles, their taps to the front)
        r = min(h / 2 - 0.06, w / 4 - 0.02); L = d - 0.03; yc = 0.1 + r
        for k, s in enumerate((-1, 1)):
            x = s * w / 4
            M.push(Matrix.Translation((x, yc, -L / 2)) @ Matrix.Rotation(math.pi / 2, 4, 'X'))
            re, rm = r - 0.04, r
            raio = lambda y, re=re, rm=rm: re + (rm - re) * math.sin(math.pi * max(0.0, min(1.0, y / L))) ** 0.75
            # (lying: the cask's own up is the room's +z; its 'top' the front head)
            aduelas(M, 'madeira', L, raio, n=14, t=0.022, chime=0.025, rings=5)
            aros(M, 'ferro', L, raio, [0.06, L / 2, L - 0.06], larg=0.033, seg=18)
            fundo_tabuas(M, 'madeira2', re - 0.02, L - 0.025, n=3)
            M.pop()
            tubo(M, 'madeira2', [(x, yc - r * 0.55, L / 2 - 0.03), (x, yc - r * 0.55, L / 2 + 0.0)], 0.014, seg=6)
            M.anchor('tampo', x, yc + r, 0, 0.12, L * 0.5)
        # (the cradle: two beams across, a wedge-shaped saddle under each cask on each)
        for zz in (-d / 2 + 0.12, d / 2 - 0.12):
            tabua(M, 'madeira2', (-w / 2 + 0.004, 0, zz - 0.045), (w / 2 - 0.004, 0.1, zz + 0.045), grain='x', seed=1100)
            for s in (-1, 1):
                for e in (-1, 1): caixa(M, 'madeira2', (s * w / 4 + e * r * 0.62 - 0.035, 0.1, zz - 0.04), (s * w / 4 + e * r * 0.62 + 0.035, yc - r * 0.62, zz + 0.04), ch=0.006 if M.lod == 0 else 0, grain='z')
    def jarras(M, w, d, h):
        # (two great jars standing in a frame of wood that holds them by their shoulders — the Egyptian's, the Aztec's)
        r = min(w / 4 - 0.02, d / 2 - 0.04)
        for s in (-1, 1):
            x = s * w / 4
            pf = [(0.04, 0.05), (0.06, 0.16), (0.2, r * 0.9), (0.42, r), (0.6, r * 0.95), (h - 0.18, r * 0.62), (h - 0.07, r * 0.42), (h - 0.03, r * 0.44), (h - 0.005, r * 0.48)]
            torno(M, 'barro', pf, seg=16, x=x, sharp=60, cap1=False)
            cilindro(M, 'madeira', x, h - 0.02, 0, r * 0.46, 0.02, seg=14)
            M.anchor('tampo', x, h, 0, r * 0.6, r * 0.6)
        for y in (0.05, h - 0.32):
            for zz in (-d / 2 + 0.03, d / 2 - 0.03): tabua(M, 'madeira2', (-w / 2 + 0.004, y, zz - 0.022), (w / 2 - 0.004, y + 0.045, zz + 0.022), grain='x', seed=1200)
        for sx in (-1, 0, 1):
            for zz in (-d / 2 + 0.03, d / 2 - 0.03): poste(M, 'madeira', sx * (w / 2 - 0.03), zz, 0, h - 0.27, 0.045, 0.045)
    return {'berco': berco, 'jarras': jarras}[style]
