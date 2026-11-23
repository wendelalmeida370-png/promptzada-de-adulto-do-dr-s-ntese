# moveis_mesas: the tables and the benches of the interiors, each people's own (the interiors 2.0, the front P2, D-710) — the
# round table (0,90 Ø, its top at 0,74), the long table of the tavern (1,60 × 0,80) and the plain one (1,10 × 0,70), the bench
# (1,40 and 1,10 × 0,35, its seat at 0,45). The frame, the parts and the rules: moveis_pecas.py.
import math
from moveis_forma import caixa, tabua, tampo, torno, cilindro, perna_torneada, tubo, lamina, TAU
from moveis_pecas import poste, quatro, aventais, travessas, pata_leao, tampo_redondo

# ------------------------------ a mesa redonda ------------------------------
def mesa_redonda(style):
    def nordico(M, w, d, h):
        # (a round top of four planks on two battens crossed under it, four legs splayed into them)
        r = min(w, d) / 2 - 0.006; t = 0.04
        tampo_redondo(M, 'madeira', r, h - t, h, n=4, seg=30)
        tabua(M, 'madeira2', (-r * 0.78, h - t - 0.05, -0.035), (r * 0.78, h - t, 0.035), grain='x', seed=11)
        tabua(M, 'madeira2', (-0.035, h - t - 0.1, -r * 0.78), (0.035, h - t - 0.05, r * 0.78), grain='z', seed=12)
        for k in range(4):
            a = k * TAU / 4 + math.pi / 4; c, s = math.cos(a), math.sin(a)
            tubo(M, 'madeira2', [(c * (r - 0.08), 0, s * (r - 0.08)), (c * 0.24, h - t - 0.08, s * 0.24)], 0.026, seg=7, rs=[0.024, 0.028])
    def delphica(M, w, d, h):
        # (the Roman mensa: a round top with a moulded edge on three lion's legs, a ring stretcher low between them)
        r = min(w, d) / 2 - 0.006
        torno(M, 'madeira', [(h - 0.045, r - 0.03), (h - 0.04, r - 0.006), (h - 0.028, r), (h - 0.012, r), (h - 0.004, r - 0.006), (h, r - 0.014), (h, 0.0001)], seg=32, sharp=45, cap0=True, cap1=False)
        for k in range(3):
            a = k * TAU / 3 + math.pi / 2; c, s = math.cos(a), math.sin(a)
            pata_leao(M, 'madeira2', c * (r - 0.14), s * (r - 0.14), 0, h - 0.045, 0.032, c, s)
            tubo(M, 'madeira2', [(c * (r - 0.21), 0.175, s * (r - 0.21)), (c * (r - 0.15), 0.175, s * (r - 0.15))], 0.012, seg=5)
        torno(M, 'madeira2', [(0.16, r - 0.21), (0.175, r - 0.2), (0.19, r - 0.21), (0.175, r - 0.222)], seg=24, cap0=False, cap1=False)
    def monopodio(M, w, d, h):
        # (the rich Roman's round table of stone on one pedestal of three lion's paws — the monopodium)
        r = min(w, d) / 2 - 0.006
        torno(M, 'pedra', [(h - 0.05, r - 0.025), (h - 0.045, r - 0.005), (h - 0.03, r), (h - 0.008, r), (h, r - 0.01), (h, 0.0001)], seg=36, sharp=45, cap1=False)
        torno(M, 'pedra', [(0.12, 0.09), (0.16, 0.07), (0.3, 0.06), (0.45, 0.055), (0.6, 0.06), (0.64, 0.085), (h - 0.05, 0.12)], seg=16, sharp=45, cap0=False, cap1=True)
        for k in range(3):
            a = k * TAU / 3 + math.pi / 2; c, s = math.cos(a), math.sin(a)
            pata_leao(M, 'pedra', c * 0.13, s * 0.13, 0, 0.16, 0.05, c, s)
    def grego(M, w, d, h):
        # (the Greek round table: three straight legs tapering, a triangle of stretchers, a painted band round its edge)
        r = min(w, d) / 2 - 0.006
        tampo_redondo(M, 'madeira', r, h - 0.035, h, n=3, seg=30, part_borda='pintura')
        L = [(math.cos(k * TAU / 3 + 0.3) * (r - 0.12), math.sin(k * TAU / 3 + 0.3) * (r - 0.12)) for k in range(3)]
        for x, z in L: poste(M, 'madeira', x, z, 0, h - 0.035, 0.034, 0.044)
        for i in range(3):
            p, q = L[i], L[(i + 1) % 3]; tubo(M, 'madeira2', [(p[0], 0.2, p[1]), (q[0], 0.2, q[1])], 0.011, seg=6)
    def papiro(M, w, d, h):
        # (the Egyptian round table on one column shaped as a papyrus stem — its capital opening under the top —, on a round foot)
        r = min(w, d) / 2 - 0.006
        tampo_redondo(M, 'madeira', r, h - 0.03, h, n=3, seg=30, part_borda='pintura')
        torno(M, 'madeira', [(0, 0.22), (0.02, 0.22), (0.04, 0.18), (0.06, 0.07), (0.1, 0.05), (0.5, 0.042), (0.56, 0.05), (0.6, 0.11), (0.66, 0.16), (h - 0.03, 0.17)], seg=14, sharp=50)
        for y in (0.12, 0.5):
            torno(M, 'pintura', [(y, 0.052), (y + 0.012, 0.056), (y + 0.024, 0.052)], seg=14, cap0=False, cap1=False)
    def asteca(M, w, d, h):
        # (the Aztec round table on a thick drum, carved in bands and painted)
        r = min(w, d) / 2 - 0.006
        tampo_redondo(M, 'madeira', r, h - 0.04, h, n=3, seg=30)
        torno(M, 'madeira2', [(0, 0.24), (0.06, 0.24), (0.07, 0.2), (h - 0.12, 0.17), (h - 0.1, 0.22), (h - 0.04, 0.22)], seg=14, sharp=40)
        for y in (0.18, 0.4):
            torno(M, 'pintura', [(y, 0.182), (y + 0.05, 0.186), (y + 0.1, 0.182)], seg=14, cap0=False, cap1=False)
    return {'nordico': nordico, 'delphica': delphica, 'monopodio': monopodio, 'grego': grego, 'papiro': papiro, 'asteca': asteca}[style]

# ------------------------------ a mesa da taverna and the plain table ------------------------------
def mesa_longa(style):
    def cavalete(M, w, d, h):
        # (the Norse trestle table: a top of three planks on two trestles — an upright board on a foot, a cleat under the top —,
        # a long stretcher through them, wedged outside)
        t = 0.045
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - t, h, 3, along='x', gap=0.008, seed=21)
        for s in (-1, 1):
            x = s * (w / 2 - 0.22)
            tabua(M, 'madeira2', (x - 0.03, 0, -d / 2 + 0.06), (x + 0.03, 0.07, d / 2 - 0.06), grain='z', seed=22 + s)
            tabua(M, 'madeira2', (x - 0.025, 0.07, -0.13), (x + 0.025, h - t - 0.05, 0.13), grain='y', seed=24 + s)
            tabua(M, 'madeira2', (x - 0.03, h - t - 0.05, -d / 2 + 0.07), (x + 0.03, h - t, d / 2 - 0.07), grain='z', seed=26 + s)
        tabua(M, 'madeira2', (-w / 2 + 0.1, 0.26, -0.03), (w / 2 - 0.1, 0.33, 0.03), grain='x', seed=28)
        for s in (-1, 1):
            x = s * (w / 2 - 0.15); tabua(M, 'madeira', (x - 0.015, 0.24, -0.045), (x + 0.015, 0.4, 0.045), grain='y', seed=29 + s)
    def romano(M, w, d, h, rico=False):
        # (the Roman table: four turned legs, the aprons, a top of four boards — the rich one's top framed in a darker wood)
        m = 0.05; L = quatro(w, d, m)
        for x, z in L: perna_torneada(M, 'madeira2' if rico else 'madeira', x, z, 0, h - 0.04, 0.034, 'bulbo', seg=10)
        aventais(M, 'madeira', w, d, h - 0.15, h - 0.04, 0.024, m - 0.02)
        if rico:
            b = 0.07
            tampo(M, 'madeira', -w / 2 + b, w / 2 - b, -d / 2 + b, d / 2 - b, h - 0.04, h, 3, along='x', gap=0.002, seed=31)
            for z0, z1 in ((-d / 2 + 0.004, -d / 2 + b), (d / 2 - b, d / 2 - 0.004)): tabua(M, 'madeira2', (-w / 2 + 0.004, h - 0.04, z0), (w / 2 - 0.004, h, z1), grain='x', seed=32)
            for x0, x1 in ((-w / 2 + 0.004, -w / 2 + b), (w / 2 - b, w / 2 - 0.004)): tabua(M, 'madeira2', (x0, h - 0.04, -d / 2 + b), (x1, h, d / 2 - b), grain='z', seed=33)
        else: tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.04, h, 4, along='x', seed=34)
        travessas(M, 'madeira2', L, 0.14, 0.014)
    def grego(M, w, d, h):
        # (the Greek table: slender legs tapering to the floor, a painted band under its top, low stretchers)
        m = 0.05; L = quatro(w, d, m)
        for x, z in L: poste(M, 'madeira', x, z, 0, h - 0.035, 0.032, 0.046)
        aventais(M, 'pintura', w, d, h - 0.11, h - 0.035, 0.02, m - 0.016)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.035, h, 3, along='x', seed=41)
        tabua(M, 'madeira2', (-w / 2 + m, 0.16, -0.02), (w / 2 - m, 0.19, 0.02), grain='x', seed=42)
        for s in (-1, 1): tabua(M, 'madeira2', (s * (w / 2 - m) - 0.015, 0.16, -d / 2 + m + 0.02), (s * (w / 2 - m) + 0.015, 0.19, d / 2 - m - 0.02), grain='z', seed=43)
    def egipcio(M, w, d, h):
        # (the Egyptian table: its legs splaying a little to the floor, braced by struts, the top of light wood, its edge painted)
        m = 0.06
        for x, z in quatro(w, d, m): tubo(M, 'madeira', [(x * 1.03, 0, z * 1.03), (x * 0.97, h - 0.035, z * 0.97)], 0.022, seg=8, rs=[0.019, 0.023])
        aventais(M, 'madeira2', w, d, h - 0.09, h - 0.035, 0.02, m - 0.012)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.035, h, 3, along='x', seed=51)
        for x, z in quatro(w, d, m): tubo(M, 'madeira2', [(x * 0.97, 0.22, z * 0.97), (x * 0.6, h - 0.09, z * 0.97)], 0.008, seg=5)
        tabua(M, 'pintura', (-w / 2 + 0.004, h - 0.036, d / 2 - 0.0125), (w / 2 - 0.004, h - 0.006, d / 2 - 0.004), ch=0.002, grain='x')
    def asteca(M, w, d, h):
        # (the Aztec table: a heavy frame on four blocky legs, low stretchers, a painted band of the people's colour)
        m = 0.04; L = quatro(w, d, m + 0.03)
        for x, z in L: caixa(M, 'madeira2', (x - 0.035, 0, z - 0.035), (x + 0.035, h - 0.04, z + 0.035), ch=0.01, grain='y')
        aventais(M, 'pintura', w, d, h - 0.14, h - 0.04, 0.026, m)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.04, h, 3, along='x', seed=61)
        travessas(M, 'madeira2', L, 0.1, 0.016)
    if style == 'romano-rico': return lambda M, w, d, h: romano(M, w, d, h, rico=True)
    return {'cavalete': cavalete, 'romano': romano, 'grego': grego, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ o banco ------------------------------
def banco(style):
    def meio_tronco(M, w, d, h):
        # (the Norse bench: a log split in half, its flat face up, on four legs splayed into its round underside)
        r = d / 2 - 0.004; yc = h - 0.002; n = 10
        def f(u, v):
            a = math.pi * (u - 0.5); x = -w / 2 + 0.005 + (w - 0.01) * v
            return (x, yc - 0.012 - 0.05 * math.cos(a), math.sin(a) * r)
        lamina(M, 'madeira2', f, n, 6, uvs=(d * 1.5, w))
        tabua(M, 'madeira', (-w / 2 + 0.005, yc - 0.012, -r), (w / 2 - 0.005, yc, r), ch=0.01, grain='x', seed=71)
        for sx in (-1, 1):
            for sz in (-1, 1):
                x = sx * (w / 2 - 0.14); tubo(M, 'madeira2', [(x + sx * 0.04, 0, sz * (r - 0.05)), (x, yc - 0.05, sz * 0.03)], 0.022, seg=7, rs=[0.02, 0.024])
    def tabuas(M, w, d, h):
        # (the Roman bench: a thick plank on two legs of boards framing an arch at their foot, a stretcher wedged through them)
        t = 0.045
        tabua(M, 'madeira', (-w / 2 + 0.004, h - t, -d / 2 + 0.004), (w / 2 - 0.004, h, d / 2 - 0.004), ch=0.01, grain='x', seed=81)
        for s in (-1, 1):
            x = s * (w / 2 - 0.16)
            tabua(M, 'madeira2', (x - 0.022, 0, -d / 2 + 0.03), (x + 0.022, h - t, -d / 2 + 0.1), grain='y', seed=82 + s)
            tabua(M, 'madeira2', (x - 0.022, 0, d / 2 - 0.1), (x + 0.022, h - t, d / 2 - 0.03), grain='y', seed=84 + s)
            tabua(M, 'madeira2', (x - 0.022, 0.2, -d / 2 + 0.1), (x + 0.022, h - t, d / 2 - 0.1), grain='y', seed=86 + s)
            tubo(M, 'madeira', [(x + s * 0.03, 0.18, 0), (x + s * 0.075, 0.27, 0)], 0.012, seg=4)
        tabua(M, 'madeira', (-w / 2 + 0.12, 0.2, -0.025), (w / 2 - 0.12, 0.25, 0.025), grain='x', seed=88)
    def grego(M, w, d, h):
        # (the Greek bench: four turned legs, its painted aprons and a seat of two boards)
        m = 0.035; L = [(sx * (w / 2 - 0.08), sz * (d / 2 - m)) for sx in (-1, 1) for sz in (-1, 1)]
        for x, z in L: perna_torneada(M, 'madeira', x, z, 0, h - 0.035, 0.025, 'carretel', seg=9)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.035, h, 2, along='x', seed=91)
        for sz in (-1, 1): tabua(M, 'pintura', (-w / 2 + 0.06, h - 0.1, sz * (d / 2 - m) - 0.012), (w / 2 - 0.06, h - 0.035, sz * (d / 2 - m) + 0.012), grain='x', seed=92)
        travessas(M, 'madeira2', [L[0], L[2], L[1], L[3]], 0.14, 0.011)
    def egipcio(M, w, d, h):
        # (the Egyptian bench: a frame of round rails with a rush seat, on straight legs braced low)
        m = 0.03; L = [(sx * (w / 2 - m), sz * (d / 2 - m)) for sx in (-1, 1) for sz in (-1, 1)]
        for x, z in L: poste(M, 'madeira', x, z, 0, h - 0.02, 0.034, 0.03)
        if w > 1.2:
            for sz in (-1, 1): poste(M, 'madeira', 0, sz * (d / 2 - m), 0, h - 0.02, 0.032, 0.028)
        from moveis_pecas import assento_trancado
        assento_trancado(M, w - 0.01, d - 0.01, h, prt='palha', conc=0.012)
        for sz in (-1, 1): tubo(M, 'madeira2', [(-w / 2 + m, 0.14, sz * (d / 2 - m)), (w / 2 - m, 0.14, sz * (d / 2 - m))], 0.011, seg=6)
    def asteca(M, w, d, h):
        # (the Aztec bench: a thick plank on two blocks of carved wood, painted on their faces)
        t = 0.05
        tabua(M, 'madeira', (-w / 2 + 0.004, h - t, -d / 2 + 0.004), (w / 2 - 0.004, h, d / 2 - 0.004), ch=0.012, grain='x', seed=95)
        for s in (-1, 1):
            x = s * (w / 2 - 0.18)
            caixa(M, 'madeira2', (x - 0.07, 0, -d / 2 + 0.03), (x + 0.07, h - t, d / 2 - 0.03), ch=0.012, grain='y')
            tabua(M, 'pintura', (x - 0.072, 0.12, d / 2 - 0.034), (x + 0.072, 0.24, d / 2 - 0.028), ch=0.003, grain='x')
    return {'meio-tronco': meio_tronco, 'tabuas': tabuas, 'grego': grego, 'egipcio': egipcio, 'asteca': asteca}[style]
