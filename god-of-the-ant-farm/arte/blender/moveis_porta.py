# moveis_porta: the leaf of a door, each people's own — the interiors 2.0, the front P2 (D-714): a leaf of 1,00 × 2,00 m, centred
# on x (the 3D moves it to its hinge and stretches it to its opening: Build3D's leaf), its foot at y = 0, the room's side toward
# +z (its battens, its bar) and the street's toward −z (its straps, its ring), its whole thickness within ± 0,06. The frame, the
# parts and the rules: moveis_pecas.py.
import math
from moveis_forma import caixa, tabua, tubo, curva, arco_pts, lamina, ovo, TAU

def folha(style):
    W, H = 0.97, 1.98   # (its own size in the nominal 1 × 2: the 3D's opening less a hair round it)
    x0, x1, y0, y1 = -W / 2, W / 2, 0.01, 0.01 + H
    def tabuas(M, w, d, h, ferro='ferro', faixas=False):
        # (the plank door of the classical lands: five upright planks, three battens and a brace on the room's side, two iron
        # straps ending in scrolls on the street's, their nails, a ring to pull it by)
        n = 5 if M.lod == 0 else 2
        for i in range(n):
            a = x0 + W * i / n + (0.002 if i else 0); b = x0 + W * (i + 1) / n - (0.002 if i < n - 1 else 0)
            tabua(M, 'madeira', (a, y0, -0.022), (b, y1, 0.022), grain='y', seed=2200 + i, jit=0.002)
        for y in (0.22, 1.0, 1.78): tabua(M, 'madeira2', (x0 + 0.06, y, 0.022), (x1 - 0.06, y + 0.12, 0.048), grain='x', seed=2210)
        # (the brace between the battens: from low at the hinge's side up to the far side)
        tubo(M, 'madeira2', [(x0 + 0.12, 0.36, 0.035), (x1 - 0.12, 0.98, 0.035)], 0.03, seg=4, oval=0.45, chao=None)
        tubo(M, 'madeira2', [(x0 + 0.12, 1.14, 0.035), (x1 - 0.12, 1.76, 0.035)], 0.03, seg=4, oval=0.45, chao=None)
        for y in (0.32, 1.68):
            caixa(M, ferro, (x0 + 0.02, y, -0.03), (x1 - 0.18, y + 0.05, -0.022), ch=0.002, grain='x')
            tubo(M, ferro, curva([(x1 - 0.18, y + 0.025, -0.027), (x1 - 0.12, y + 0.06, -0.027), (x1 - 0.09, y + 0.02, -0.027), (x1 - 0.12, y - 0.01, -0.027)], 6), 0.007, seg=4, chao=None)
            if M.lod == 0:
                for k in range(5): ovo(M, ferro, x0 + 0.08 + k * 0.15, y + 0.025, -0.031, 0.008, 0.008, seg=5, nv=3)
        tubo(M, ferro, [p for p in arco_pts((x1 - 0.16, 1.02, -0.045), 0.05, -math.pi / 2 - 1.2, -math.pi / 2 + 1.2 + TAU * 0.0, 8, plane='xy')], 0.007, seg=4, chao=None)
        ovo(M, ferro, x1 - 0.16, 1.03, -0.03, 0.018, 0.018, seg=6, nv=3)
    def painel(M, w, d, h, pintado=False, cravos='bronze'):
        # (the Roman panelled door: stiles and rails framing two panels on each side, bronze studs on the street's side, a ring)
        fr = 'madeira'; pn = 'pintura' if pintado else 'madeira2'
        for a, b in ((x0, x0 + 0.12), (x1 - 0.12, x1)): tabua(M, fr, (a, y0, -0.028), (b, y1, 0.028), grain='y', seed=2300)
        for c, e in ((y0, y0 + 0.16), (0.92, 1.06), (y1 - 0.14, y1)): tabua(M, fr, (x0 + 0.12, c, -0.028), (x1 - 0.12, e, 0.028), grain='x', seed=2301)
        for c, e in ((y0 + 0.16, 0.92), (1.06, y1 - 0.14)):
            caixa(M, pn, (x0 + 0.12, c, -0.016), (x1 - 0.12, e, 0.016), ch=0.0, grain='y')
            for z, s in ((-0.016, -1), (0.016, 1)):
                caixa(M, pn, (x0 + 0.17, c + 0.05, z - (0.012 if s < 0 else 0)), (x1 - 0.17, e - 0.05, z + (0.012 if s > 0 else 0)), ch=0.01, grain='y')
        if M.lod == 0:
            for y in (y0 + 0.08, 0.99, y1 - 0.07):
                for k in range(4): ovo(M, cravos, x0 + 0.06 + k * (W - 0.12) / 3, y, -0.03, 0.014, 0.014, seg=6, nv=3)
        tubo(M, cravos, arco_pts((x1 - 0.2, 1.0, -0.05), 0.055, -math.pi / 2 - 1.3, -math.pi / 2 + 1.3, 8, plane='xy'), 0.008, seg=4, chao=None)
        ovo(M, cravos, x1 - 0.2, 1.06, -0.034, 0.024, 0.024, seg=7, nv=3)
    def egipcio(M, w, d, h):
        # (the Egyptian door: planks between battens across both faces at the top and the foot, a painted band, a bolt)
        n = 4 if M.lod == 0 else 2
        for i in range(n):
            a = x0 + W * i / n + (0.002 if i else 0); b = x0 + W * (i + 1) / n - (0.002 if i < n - 1 else 0)
            tabua(M, 'madeira', (a, y0, -0.02), (b, y1, 0.02), grain='y', seed=2400 + i)
        for c in (y0 + 0.06, y1 - 0.2):
            for z0, z1 in ((-0.042, -0.02), (0.02, 0.042)): tabua(M, 'madeira2', (x0 + 0.01, c, z0), (x1 - 0.01, c + 0.14, z1), grain='x', seed=2410)
        caixa(M, 'pintura', (x0 + 0.02, 1.48, -0.023), (x1 - 0.02, 1.56, -0.02), ch=0.001, grain='x')
        caixa(M, 'madeira2', (x1 - 0.3, 1.0, 0.02), (x1 - 0.02, 1.05, 0.05), ch=0.006, grain='x')
        ovo(M, 'madeira2', x1 - 0.1, 1.02, -0.035, 0.02, 0.02, seg=6, nv=3)
    def nordico(M, w, d, h):
        # (the Norse door: thick planks, three battens, long iron straps curling into scrolls across its street face, a big ring)
        n = 4 if M.lod == 0 else 2
        for i in range(n):
            a = x0 + W * i / n + (0.003 if i else 0); b = x0 + W * (i + 1) / n - (0.003 if i < n - 1 else 0)
            tabua(M, 'madeira', (a, y0, -0.028), (b, y1, 0.028), grain='y', seed=2500 + i, jit=0.004)
        for y in (0.2, 0.95, 1.7): tabua(M, 'madeira2', (x0 + 0.05, y, 0.028), (x1 - 0.05, y + 0.14, 0.058), grain='x', seed=2510, jit=0.003)
        for y in (0.28, 1.0, 1.72):
            caixa(M, 'ferro', (x0 + 0.02, y, -0.036), (x1 - 0.25, y + 0.055, -0.028), ch=0.002, grain='x')
            for s in (1, -1):
                tubo(M, 'ferro', curva([(x1 - 0.25, y + 0.027, -0.032), (x1 - 0.18, y + 0.027 + s * 0.05, -0.032), (x1 - 0.12, y + 0.027 + s * 0.02, -0.032), (x1 - 0.15, y + 0.027 - s * 0.01, -0.032)], 7), 0.008, seg=4, chao=None)
        tubo(M, 'ferro', arco_pts((x1 - 0.2, 0.92, -0.05), 0.08, -math.pi / 2 - 1.3, -math.pi / 2 + 1.3, 8, plane='xy'), 0.01, seg=5, chao=None)
        ovo(M, 'ferro', x1 - 0.2, 1.0, -0.036, 0.028, 0.028, seg=7, nv=3)
    def asteca(M, w, d, h):
        # (the Aztec door: a mat of woven reed on a light frame of poles, tied at its corners, a painted band across)
        for x in (x0 + 0.03, x1 - 0.03): tubo(M, 'madeira2', [(x, y0, 0), (x, y1, 0)], 0.026, seg=6, chao=None)
        for y in (y0 + 0.04, 1.0, y1 - 0.04): tubo(M, 'madeira2', [(x0 + 0.03, y, 0.0), (x1 - 0.03, y, 0.0)], 0.022, seg=6, chao=None)
        lamina(M, 'palha', lambda u, v: (x0 + 0.05 + (W - 0.1) * u, y0 + 0.05 + (H - 0.1) * v, 0.003 * math.sin(u * 30) * math.sin(v * 3)), 4, 8, both=True, uvs=(W, H))
        caixa(M, 'pintura', (x0 + 0.05, 1.5, -0.006), (x1 - 0.05, 1.58, 0.006), ch=0.0, grain='x')
    if style == 'romano': return lambda M, w, d, h: painel(M, w, d, h)
    if style == 'grego': return lambda M, w, d, h: painel(M, w, d, h, pintado=True)
    return {'tabuas': tabuas, 'egipcio': egipcio, 'nordico': nordico, 'asteca': asteca}[style]
