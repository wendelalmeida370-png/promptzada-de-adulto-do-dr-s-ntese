# moveis_quarto: the musician's corner and the rooms of the inn — the interiors 2.0, the front P2 (D-710): the low stage where
# the musician plays (1,60 × 1,20 × 0,25), the lamp stand (0,45 × 0,45 × 1,60), the bed (0,90 × 1,95 × 0,50, its head against the
# wall at −z) and the bed of two (1,40 × 1,95 × 0,55), the chest (0,90 × 0,50 × 0,55). The frame, the parts and the rules:
# moveis_pecas.py.
import math
from moveis_forma import (caixa, tabua, tampo, torno, cilindro, perna_torneada, tubo, curva, lamina, almofada, ovo, pedra, TAU)
from moveis_pecas import poste, quatro, aventais, travessas, pata_leao
from moveis_bar import papiro_coluna

def tapete(M, part, x0, x1, z0, z1, y, onda=0.006, borda='pano2', seed=0):
    """a rug laid on a floor: a cloth a little off flat, a band of its second colour round its edge"""
    lamina(M, part, lambda u, v: (x0 + (x1 - x0) * u, y + 0.004 + onda * math.sin(u * 7.1 + seed) * math.sin(v * 5.3 + seed * 2) * math.sin(math.pi * u) * math.sin(math.pi * v), z0 + (z1 - z0) * v), 8, 6, uvs=(x1 - x0, z1 - z0))
    b = 0.06
    for (a, c, e, f) in ((x0 + b, z0 + b, x1 - b, z0 + b * 1.6), (x0 + b, z1 - b * 1.6, x1 - b, z1 - b)):
        caixa(M, borda, (a, y + 0.002, c), (e, y + 0.0075, f), ch=0.0, grain='x')

# ------------------------------ o estrado (the musician's corner) ------------------------------
def estrado(style):
    def tablado(M, w, d, h, pintado=False):
        # (a stage of boards on joists, its skirt round it, a nosing at its front, a rug on it where the musician stands)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; t = 0.035
        for (a, b, c, e) in ((x0, z1 - 0.03, x1, z1), (x0, z0, x1, z0 + 0.03), (x0, z0 + 0.03, x0 + 0.03, z1 - 0.03), (x1 - 0.03, z0 + 0.03, x1, z1 - 0.03)):
            tabua(M, 'pintura' if pintado else 'madeira2', (a, 0, b), (c, h - t, e), grain='x' if c - a > e - b else 'z', seed=1800)
        tampo(M, 'madeira', x0, x1, z0, z1, h - t, h, 7, along='x', gap=0.005, seed=1810)
        tubo(M, 'madeira2', [(x0 + 0.01, h - 0.012, z1 - 0.012), (x1 - 0.01, h - 0.012, z1 - 0.012)], 0.014, seg=6)
        tapete(M, 'pano', x0 + 0.2, x1 - 0.2, z0 + 0.15, z1 - 0.2, h, seed=1)
        M.anchor('tampo', 0, h, -0.1, w - 0.4, 0.4)
    def nordico(M, w, d, h):
        # (rough planks on two logs, a pelt spread on them)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; t = 0.05
        for zz in (z0 + 0.15, 0.0, z1 - 0.15):
            from moveis_forma import tora
            tora(M, 'madeira2', (x0 + 0.02, (h - t) / 2, zz), (x1 - 0.02, (h - t) / 2, zz), (h - t) / 2, seg=7, seed=int(zz * 100), cerne='madeira')
        tampo(M, 'madeira', x0, x1, z0, z1, h - t, h, 6, along='x', gap=0.008, seed=1820)
        def pele(u, v):
            a = u * TAU; r = 0.42 + 0.06 * math.sin(a * 3) + 0.04 * math.sin(a * 5 + 1)
            return (math.cos(a) * r * v * 1.25, h + 0.008 + 0.012 * (1 - v), math.sin(a) * r * v * 0.85 - 0.05)
        lamina(M, 'couro', pele, 16, 3, uvs=(1.0, 1.0))
        M.anchor('tampo', 0, h, -0.1, w - 0.4, 0.4)
    def egipcio(M, w, d, h):
        # (a low platform, its skirt painted, a reed mat on it)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004
        caixa(M, 'madeira', (x0, 0, z0), (x1, h - 0.03, z1), ch=0.012, grain='x')
        caixa(M, 'pintura', (x0 + 0.02, 0.06, z1 - 0.002), (x1 - 0.02, h - 0.08, z1 + 0.0), ch=0.002, grain='x')
        caixa(M, 'palha', (x0 + 0.05, h - 0.03, z0 + 0.05), (x1 - 0.05, h, z1 - 0.05), ch=0.008, grain='x')
        M.anchor('tampo', 0, h, -0.1, w - 0.4, 0.4)
    def asteca(M, w, d, h):
        # (a step of stucco, its band painted, a petate on it)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004
        caixa(M, 'reboco', (x0, 0, z0), (x1, h - 0.012, z1), ch=0.02, jit=0.003, seed=1830)
        caixa(M, 'pintura', (x0 + 0.03, 0.05, z1 - 0.002), (x1 - 0.03, 0.13, z1 + 0.0), ch=0.002, grain='x')
        lamina(M, 'palha', lambda u, v: (x0 + 0.12 + (x1 - x0 - 0.24) * u, h - 0.012 + 0.012 + 0.003 * math.sin(u * 9) * math.sin(v * 7), z0 + 0.1 + (z1 - z0 - 0.2) * v), 6, 5, uvs=(1.2, 1.0))
        M.anchor('tampo', 0, h, -0.1, w - 0.4, 0.4)
    if style == 'grego': return lambda M, w, d, h: tablado(M, w, d, h, pintado=True)
    return {'tablado': tablado, 'nordico': nordico, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ o lampadário ------------------------------
def lampadario(style):
    def candelabro(M, w, d, h):
        # (the classical lamp stand of bronze: three legs ending in paws, a slender shaft ringed, a dish at its top with the lamp of
        # clay on it — the metal by what the people has: the part bronze)
        for k in range(3):
            a = k * TAU / 3 + math.pi / 2; c, s = math.cos(a), math.sin(a)
            tubo(M, 'bronze', curva([(c * 0.17, 0.03, s * 0.17), (c * 0.13, 0.12, s * 0.13), (c * 0.04, 0.2, s * 0.04)], 6), 0.012, seg=6, rs=[0.014, 0.012, 0.011, 0.012, 0.014, 0.018])
            ovo(M, 'bronze', c * 0.18, 0.022, s * 0.18, 0.026, 0.022, seg=7, nv=4)
        torno(M, 'bronze', [(0.18, 0.035), (0.22, 0.04), (0.26, 0.022), (0.3, 0.016), (h - 0.2, 0.012), (h - 0.17, 0.022), (h - 0.14, 0.014), (h - 0.06, 0.016), (h - 0.03, 0.05), (h - 0.02, 0.11), (h - 0.012, 0.115), (h - 0.012, 0.0001)], seg=10, sharp=60, cap0=True, cap1=False)
        torno(M, 'barro', [(h - 0.012, 0.03), (h + 0.01, 0.06), (h + 0.035, 0.055), (h + 0.04, 0.03), (h + 0.04, 0.0001)], seg=10, sharp=60, cap0=False, cap1=False)
        tubo(M, 'barro', [(0.05, h + 0.025, 0), (0.1, h + 0.03, 0)], 0.013, seg=6, chao=None)
        M.anchor('tampo', 0, h + 0.04, 0, 0.1, 0.1)
    def nordico(M, w, d, h):
        # (a wooden post on a cross of feet, an iron dish and its pricket at the top for the candle of tallow)
        for a in (0, math.pi / 2):
            c, s = math.cos(a), math.sin(a)
            tabua(M, 'madeira2', (-0.2 * c - 0.03 * s, 0, -0.2 * s - 0.03 * c), (0.2 * c + 0.03 * s, 0.07, 0.2 * s + 0.03 * c), grain='x' if a == 0 else 'z', seed=1900)
        poste(M, 'madeira', 0, 0, 0.07, h - 0.06, 0.06, 0.045)
        torno(M, 'ferro', [(h - 0.06, 0.02), (h - 0.05, 0.1), (h - 0.03, 0.105), (h - 0.035, 0.0001)], seg=10, sharp=60, cap0=True, cap1=False)
        cilindro(M, 'pano', 0, h - 0.035, 0, 0.022, 0.07, seg=8)
    def egipcio(M, w, d, h):
        # (a stand of papyrus, painted bands, a bowl lamp of clay on its open capital)
        torno(M, 'madeira2', [(0, 0.17), (0.04, 0.17), (0.06, 0.08), (0.08, 0.06)], seg=12, sharp=60)
        papiro_coluna(M, 'madeira', 0, 0, 0.08, h - 0.05, 0.035)
        torno(M, 'barro', [(h - 0.05, 0.04), (h - 0.03, 0.09), (h, 0.1), (h, 0.085), (h - 0.025, 0.0001)], seg=12, sharp=60, cap0=False, cap1=False)
    def asteca(M, w, d, h):
        # (a brazier of clay on a column of stone: the copal burned in it)
        torno(M, 'pedra', [(0, 0.19), (0.08, 0.19), (0.1, 0.12), (h - 0.3, 0.08), (h - 0.26, 0.12), (h - 0.22, 0.12)], seg=10, sharp=50)
        torno(M, 'barro', [(h - 0.22, 0.08), (h - 0.18, 0.16), (h - 0.04, 0.2), (h - 0.02, 0.19), (h - 0.08, 0.14), (h - 0.1, 0.0001)], seg=14, sharp=60, cap0=False, cap1=False)
        torno(M, 'pintura', [(h - 0.12, 0.183), (h - 0.1, 0.19), (h - 0.08, 0.193)], seg=14, cap0=False, cap1=False)
    return {'candelabro': candelabro, 'nordico': nordico, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ a cama (the head at −z, against the wall) ------------------------------
def cama(style):
    def lectus(M, w, d, h):
        # (the classical bed: turned legs, its rails, the curved headrest at its head (the fulcrum), the mattress, the pillow and a
        # cover thrown over its foot)
        m = 0.05; L = quatro(w, d, m); hy = h - 0.13
        for x, z in L: perna_torneada(M, 'madeira', x, z, 0, hy + 0.03, 0.032, 'bulbo', seg=10)
        aventais(M, 'madeira2', w, d, hy - 0.08, hy + 0.02, 0.03, m - 0.022)
        for s in (-1, 1):
            tubo(M, 'madeira', curva([(s * (w / 2 - m), hy + 0.02, -d / 2 + 0.06), (s * (w / 2 - m), hy + 0.25, -d / 2 + 0.035), (s * (w / 2 - m), hy + 0.33, -d / 2 + 0.11), (s * (w / 2 - m) * 0.98, hy + 0.3, -d / 2 + 0.2)], 8), 0.024, seg=7, chao=None)
            ovo(M, 'bronze', s * (w / 2 - m), hy + 0.31, -d / 2 + 0.16, 0.026, 0.026, seg=8)
        almofada(M, 'pano', (-w / 2 + 0.03, hy, -d / 2 + 0.05), (w / 2 - 0.03, h, d / 2 - 0.03), e=0.25)
        n = 2 if w > 1.2 else 1
        for k in range(n):
            x = 0 if n == 1 else (k - 0.5) * w / 2
            almofada(M, 'pano2', (x - (w / n - 0.12) / 2, h - 0.03, -d / 2 + 0.08), (x + (w / n - 0.12) / 2, h + 0.08, -d / 2 + 0.38), e=0.45)
        cob(M, w, d, h, d * 0.42)
        M.anchor('tampo', 0, h, 0.2, w - 0.2, d * 0.5)
    def egipcio(M, w, d, h):
        # (the Egyptian bed: lion's legs, the frame sloping a little toward its foot, a footboard painted at its foot, the woven
        # bed and its linen, and at its head the headrest of wood instead of a pillow)
        m = 0.05; hy = h - 0.08
        for sx in (-1, 1):
            pata_leao(M, 'madeira', sx * (w / 2 - m), -d / 2 + m, 0, hy + 0.04, 0.03, 0, -1, tambor='madeira2')
            pata_leao(M, 'madeira', sx * (w / 2 - m), d / 2 - m, 0, hy - 0.02, 0.03, 0, 1, tambor='madeira2')
            tubo(M, 'madeira2', [(sx * (w / 2 - m), hy + 0.04, -d / 2 + m), (sx * (w / 2 - m), hy - 0.02, d / 2 - m)], 0.026, seg=7, chao=None)
        tabua(M, 'pintura', (-w / 2 + m, hy - 0.02, d / 2 - 0.03), (w / 2 - m, hy + 0.32, d / 2 - 0.006), grain='x', seed=1950)
        tabua(M, 'madeira', (-w / 2 + m - 0.01, hy + 0.32, d / 2 - 0.034), (w / 2 - m + 0.01, hy + 0.35, d / 2 - 0.004), grain='x', seed=1951)
        lamina(M, 'palha', lambda u, v: (-w / 2 + m + (w - 2 * m) * u, hy + 0.04 - 0.06 * v + 0.01 * math.sin(math.pi * u), -d / 2 + m + (d - 2 * m - 0.03) * v), 4, 6)
        lamina(M, 'pano', lambda u, v: (-w / 2 + 0.03 + (w - 0.06) * u, hy + 0.055 - 0.06 * v + 0.012 * math.sin(math.pi * u), -d / 2 + 0.1 + (d - 0.2) * v), 6, 6)
        hx = 0
        torno(M, 'madeira', [(hy + 0.05, 0.07), (hy + 0.07, 0.06), (hy + 0.09, 0.025), (hy + 0.16, 0.022)], seg=10, x=hx, z=-d / 2 + 0.2, sharp=50, oval=0.6)
        tubo(M, 'madeira', curva([(-0.12, hy + 0.24, -d / 2 + 0.2), (0, hy + 0.17, -d / 2 + 0.2), (0.12, hy + 0.24, -d / 2 + 0.2)], 7), 0.03, seg=6, oval=0.45, chao=None)
        M.anchor('tampo', 0, hy + 0.06, 0.2, w - 0.2, d * 0.5)
    def nordico(M, w, d, h):
        # (the Norse box bed: plank sides, the head posts carved to knobs, a straw mattress, a pelt and a wool blanket on it)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004
        for s in (-1, 1): tabua(M, 'madeira', (s * (w / 2 - 0.004) - (0.04 if s > 0 else 0), 0.04, z0 + 0.08), (s * (w / 2 - 0.004) + (0.04 if s < 0 else 0), h - 0.05, z1 - 0.06), grain='z', seed=2000 + s, jit=0.003)
        tabua(M, 'madeira', (x0 + 0.08, 0.04, z1 - 0.045), (x1 - 0.08, h - 0.05, z1 - 0.004), grain='x', seed=2003, jit=0.003)
        tabua(M, 'madeira', (x0 + 0.08, 0.04, z0 + 0.004), (x1 - 0.08, h + 0.25, z0 + 0.05), grain='x', seed=2004, jit=0.003)
        for sx in (-1, 1):
            for zz, top in ((z0 + 0.04, h + 0.38), (z1 - 0.03, h + 0.05)):
                caixa(M, 'madeira2', (sx * (w / 2 - 0.004) - (0.07 if sx > 0 else 0), 0, zz - 0.035), (sx * (w / 2 - 0.004) + (0.07 if sx < 0 else 0), top, zz + 0.035), ch=0.01, grain='y', jit=0.002, seed=2010)
                ovo(M, 'madeira2', sx * (w / 2 - 0.039), top + 0.03, zz, 0.032, 0.035, seg=8)
        almofada(M, 'palha', (x0 + 0.05, h - 0.2, z0 + 0.06), (x1 - 0.05, h - 0.04, z1 - 0.05), e=0.3)
        cob(M, w - 0.06, d - 0.1, h - 0.04, d * 0.55, part='pano2')
        def pele(u, v):
            a = u * TAU; r = 0.3 + 0.05 * math.sin(a * 3 + 1)
            return (math.cos(a) * r * v * 1.1, h - 0.02 + 0.02 * (1 - v), -d / 2 + 0.6 + math.sin(a) * r * v * 0.7)
        lamina(M, 'couro', pele, 14, 3)
        M.anchor('tampo', 0, h - 0.04, 0.2, w - 0.2, d * 0.5)
    def asteca(M, w, d, h):
        # (the Aztec bed: a low frame of poles on short posts, a petate on it, a cotton blanket folded at its foot)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; hy = h - 0.06
        for x, z in quatro(w, d, 0.06): caixa(M, 'madeira2', (x - 0.035, 0, z - 0.035), (x + 0.035, hy, z + 0.035), ch=0.008, grain='y')
        for s in (-1, 1):
            tubo(M, 'madeira2', [(s * (w / 2 - 0.06), hy - 0.03, z0 + 0.02), (s * (w / 2 - 0.06), hy - 0.03, z1 - 0.02)], 0.03, seg=7, chao=None)
        n = 9 if M.lod == 0 else 4
        for k in range(n): tubo(M, 'madeira', [(x0 + 0.03, hy - 0.005, z0 + 0.1 + (d - 0.2) * k / (n - 1)), (x1 - 0.03, hy - 0.005, z0 + 0.1 + (d - 0.2) * k / (n - 1))], 0.018, seg=5, chao=None)
        caixa(M, 'palha', (x0 + 0.02, hy + 0.012, z0 + 0.03), (x1 - 0.02, hy + 0.03, z1 - 0.03), ch=0.006, grain='z')
        almofada(M, 'pano2', (x0 + 0.06, hy + 0.03, z1 - 0.5), (x1 - 0.06, hy + 0.1, z1 - 0.1), e=0.25)
        almofada(M, 'pano', (-0.25, hy + 0.03, z0 + 0.06), (0.25, hy + 0.1, z0 + 0.3), e=0.45)
        M.anchor('tampo', 0, hy + 0.03, 0, w - 0.2, d * 0.4)
    return {'lectus': lectus, 'egipcio': egipcio, 'nordico': nordico, 'asteca': asteca}[style]

def cob(M, w, d, h, comp, part='pano2'):
    """a cover over the foot of a bed: lying on the mattress and falling over its sides and its foot"""
    hw, z0, z1 = w / 2 - 0.006, d / 2 - comp, d / 2 - 0.01; drop = 0.18
    def f(u, v):
        x = -hw + 2 * hw * u; z = z0 + (z1 - z0) * v
        e = max(0.0, (abs(x) - (hw - 0.06)) / 0.06)
        y = h + 0.012 - drop * min(1.0, e) ** 1.5 + 0.008 * math.sin(v * 9 + u * 3)
        x = math.copysign(min(abs(x), hw), x)
        return (x, y, z)
    lamina(M, part, f, 12, 6, both=True, uvs=(w, comp))

# ------------------------------ a arca ------------------------------
def arca(style):
    def nordico(M, w, d, h):
        # (the Norse chest of planks, its lid a little proud, bound with iron straps over it and down its front, a hasp)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; lh = 0.09
        for (a, b, c, e) in ((x0 + 0.03, z0 + 0.03, x1 - 0.03, z1 - 0.03),):
            caixa(M, 'madeira', (a, 0.0, b), (c, h - lh, e), ch=0.008, jit=0.002, seed=2100)
        for s in (-1, 1): caixa(M, 'madeira2', (s * (w / 2 - 0.004) - (0.05 if s > 0 else 0), 0, z0 + 0.02), (s * (w / 2 - 0.004) + (0.05 if s < 0 else 0), h - lh, z1 - 0.02), ch=0.01, jit=0.002, seed=2101)
        caixa(M, 'madeira', (x0, h - lh, z0), (x1, h, z1), ch=0.014, jit=0.002, seed=2102, grain='x')
        for x in (-w / 4, w / 4):
            caixa(M, 'ferro', (x - 0.025, h - 0.006, z0 + 0.004), (x + 0.025, h + 0.0, z1 - 0.004), ch=0.002)
            caixa(M, 'ferro', (x - 0.025, h - lh - 0.12, z1 - 0.008), (x + 0.025, h, z1 - 0.002), ch=0.002)
        caixa(M, 'ferro', (-0.04, h - lh - 0.1, z1 - 0.01), (0.04, h - lh + 0.02, z1 - 0.002), ch=0.002)
        M.anchor('tampo', 0, h, 0, w - 0.1, d - 0.1)
    def romano(M, w, d, h, pintado=False):
        # (the classical chest: a frame of rails and stiles with its panels, on four bun feet, iron at its corners and its lock)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; f = 0.06; lh = 0.07
        for x, z in quatro(w, d, 0.05): ovo(M, 'madeira2', x, f / 2, z, 0.04, f / 2, seg=8, nv=4)
        caixa(M, 'madeira2', (x0 + 0.01, f, z0 + 0.01), (x1 - 0.01, h - lh, z1 - 0.01), ch=0.008, seed=2110)
        for i in range(2):
            a = x0 + 0.05 + (x1 - x0 - 0.1) * i / 2 + 0.02; b = x0 + 0.05 + (x1 - x0 - 0.1) * (i + 1) / 2 - 0.02
            tabua(M, 'pintura' if pintado else 'madeira', (a, f + 0.05, z1 - 0.012), (b, h - lh - 0.05, z1), ch=0.008, grain='x', seed=2111 + i)
        caixa(M, 'madeira', (x0, h - lh, z0), (x1, h, z1), ch=0.012, seed=2113, grain='x')
        for x in (x0 + 0.012, x1 - 0.012):
            caixa(M, 'ferro', (x - 0.012, f, z1 - 0.012), (x + 0.012, h - lh, z1 + 0.0), ch=0.002)
        caixa(M, 'ferro', (-0.035, h - lh - 0.08, z1 - 0.004), (0.035, h - lh + 0.02, z1 + 0.0), ch=0.002)
        for s in (-1, 1): tubo(M, 'ferro', [(s * (w / 2 - 0.006), h - lh - 0.1, -0.05), (s * (w / 2 - 0.006), h - lh - 0.16, 0), (s * (w / 2 - 0.006), h - lh - 0.1, 0.05)], 0.006, seg=4, chao=None)
        M.anchor('tampo', 0, h, 0, w - 0.1, d - 0.1)
    def egipcio(M, w, d, h):
        # (the Egyptian chest on its short legs: the panels painted, the lid gabled, two knobs to tie it shut)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004; f = 0.1; hb = h - 0.12
        for x, z in quatro(w, d, 0.03): poste(M, 'madeira2', x, z, 0, f + 0.02, 0.05, 0.05)
        caixa(M, 'madeira', (x0, f, z0), (x1, hb, z1), ch=0.008, seed=2120)
        caixa(M, 'pintura', (x0 + 0.04, f + 0.04, z1 - 0.003), (x1 - 0.04, hb - 0.04, z1 + 0.0), ch=0.002, grain='x')
        from moveis_forma import tronco
        # (the gabled lid: its two slopes and its two ends, the ridge across the chest's length)
        tronco(M, 'madeira', (x0, z0, x1, z1), (x0, -0.01, x1, 0.01), hb, h, faces='fedt')
        tronco(M, 'madeira2', (x0, z1 - 0.004, x1, z1 + 0.0), (x0, z1 - 0.004, x1, z1), hb - 0.02, hb, faces='f')
        ovo(M, 'madeira2', 0, hb + 0.03, z1 * 0.72, 0.02, 0.02, seg=7); ovo(M, 'madeira2', 0, hb - 0.05, z1 - 0.012, 0.02, 0.02, seg=7)
        M.anchor('tampo', 0, h, 0, 0.1, d - 0.1)
    def petlacalli(M, w, d, h):
        # (the Aztec box of woven reed: a frame of poles at its edges, the weave between, its lid)
        x0, x1, z0, z1 = -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004
        almofada(M, 'palha', (x0 + 0.01, 0, z0 + 0.01), (x1 - 0.01, h - 0.06, z1 - 0.01), e=0.12)
        almofada(M, 'palha', (x0, h - 0.07, z0), (x1, h, z1), e=0.18)
        for sx in (-1, 1):
            for sz in (-1, 1): tubo(M, 'madeira2', [(sx * (w / 2 - 0.02), 0.0, sz * (d / 2 - 0.02)), (sx * (w / 2 - 0.02), h - 0.07, sz * (d / 2 - 0.02))], 0.014, seg=5)
        for y in (0.012, h - 0.075): tubo(M, 'pintura', [(x0 + 0.01, y, z1 - 0.012), (x1 - 0.01, y, z1 - 0.012)], 0.01, seg=5, chao=None)
        M.anchor('tampo', 0, h, 0, w - 0.1, d - 0.1)
    if style == 'grego': return lambda M, w, d, h: romano(M, w, d, h, pintado=True)
    return {'nordico': nordico, 'romano': romano, 'egipcio': egipcio, 'petlacalli': petlacalli}[style]
