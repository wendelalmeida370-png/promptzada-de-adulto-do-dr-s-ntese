# moveis_pecas: the pieces of furniture of the interiors, each people's own (the interiors 2.0, the front P2, D-710 to D-719) —
# what arte/blender/moveis.py builds and writes into js/movelmesh.js. Each piece is a function of its size (the plan's: w across
# its front, d deep, h its height — the seat's, the top's —, int-moveis.js and planos/interiores-2-contrato.md §4) drawing in the
# game's frame (metres, Y up, the front toward +Z where its user stands, its foot at y = 0, centred on its rectangle — and never
# out of it: the body bumps the rectangle, not the mesh). The shapes are moveis_forma.py's.
# The parts (the material the game paints each in — js/movel3d.js resolves it by what the people has):
#   madeira (the wood of the piece), madeira2 (its second wood: the darker rails, the inlay), pintura (the painted part: the
#   people's colour), ferro (the fittings: iron where the people has iron, bronze where only bronze, a binding of withies where
#   neither — the hoops of the cask), bronze (a thing of bronze: bronze, or else iron, or else wood), pano / pano2 (cloth and its
#   second colour: the sheet and the blanket, the rug; skins where the people does not weave), couro (leather, or rush), palha
#   (straw, rush and reed: the woven seat, the mat, the wicker), barro (fired clay: the jar, the pot), pedra (the stone of the
#   people), reboco (the plaster or the mud render of masonry), liquido (what is in a vat), brasa (the embers).
# Which people use which model: TABLE (the first people of a model gives it its name; the others are its alias).
import math, random
from moveis_forma import (caixa, tabua, tampo, torno, cilindro, perna_torneada, tubo, curva, arco_pts, lamina, almofada, ovo,
                          pedra, brasas, tora, bloco_arco, TAU)

CIVS = ['classico', 'romano', 'grego', 'egipcio', 'nordico', 'asteca']
PART_ORDER = ['madeira', 'madeira2', 'pintura', 'ferro', 'bronze', 'pano', 'pano2', 'couro', 'palha', 'barro', 'pedra', 'reboco', 'liquido', 'brasa']
# (the colours of the sheet's pictures — near what the game paints by default: js/movel3d.js COR; linear, for Cycles)
COR = {'madeira': (0.30, 0.17, 0.085), 'madeira2': (0.17, 0.095, 0.05), 'pintura': (0.36, 0.09, 0.06), 'ferro': (0.05, 0.05, 0.048), 'bronze': (0.42, 0.25, 0.08),
       'pano': (0.62, 0.56, 0.45), 'pano2': (0.42, 0.14, 0.10), 'couro': (0.28, 0.15, 0.07), 'palha': (0.52, 0.40, 0.18), 'barro': (0.46, 0.18, 0.08),
       'pedra': (0.42, 0.40, 0.36), 'reboco': (0.70, 0.62, 0.50), 'liquido': (0.09, 0.04, 0.02), 'brasa': (0.9, 0.3, 0.05)}
RUGO = {'madeira': 0.6, 'madeira2': 0.55, 'pintura': 0.55, 'ferro': 0.45, 'bronze': 0.35, 'pano': 0.95, 'pano2': 0.95, 'couro': 0.7, 'palha': 0.9, 'barro': 0.75, 'pedra': 0.85, 'reboco': 0.95, 'liquido': 0.15, 'brasa': 1.0}

def R(seed): return random.Random(seed)

# ------------------------------ helpers ------------------------------
def poste(M, part, x, z, y0, y1, s0, s1=None, seg=4, a0=math.pi / 4):
    """a square post, tapering from s0 (its foot, side) to s1 (its top) — a lathe of four flat sides"""
    s1 = s1 if s1 is not None else s0
    r0, r1 = s0 / math.sqrt(2), s1 / math.sqrt(2)
    torno(M, part, [(y0, r0), (y1, r1)], seg=seg if M.lod == 0 else 4, x=x, z=z, a0=a0, sharp=30, flat=True)

def quatro(w, d, m):
    """the four corners of a rectangle m in from its edges"""
    return [(sx * (w / 2 - m), sz * (d / 2 - m)) for sx in (-1, 1) for sz in (-1, 1)]

def aventais(M, part, w, d, y0, y1, t, m, ch=0.006, frente=True):
    """the aprons under a top or a seat: four boards t thick, their outer faces m in from the edges"""
    x0, x1, z0, z1 = -w / 2 + m, w / 2 - m, -d / 2 + m, d / 2 - m
    if frente: tabua(M, part, (x0, y0, z1 - t), (x1, y1, z1), ch=ch, grain='x', seed=1)
    tabua(M, part, (x0, y0, z0), (x1, y1, z0 + t), ch=ch, grain='x', seed=2)
    tabua(M, part, (x0, y0, z0 + t), (x0 + t, y1, z1 - t), ch=ch, grain='z', seed=3)
    tabua(M, part, (x1 - t, y0, z0 + t), (x1, y1, z1 - t), ch=ch, grain='z', seed=4)

def travessas(M, part, pts, y, r):
    """round stretchers between the legs, a hand off the floor: front, back and sides"""
    (a, b), (c, e), (f, g), (h, i) = pts
    for p, q in (((a, b), (c, e)), ((f, g), (h, i)), ((a, b), (f, g)), ((c, e), (h, i))):
        tubo(M, part, [(p[0], y, p[1]), (q[0], y, q[1])], r, seg=6, caps=False)

def pata_leao(M, part, x, z, y0, y1, r, ox, oz, tambor=None):
    """a lion's leg from its top at y1 to its paw on the floor: the haunch, the hock, the paw with its toes forward (ox, oz: the
    way out), on a little drum (tambor: its part) as the Egyptian's stood"""
    l = math.hypot(ox, oz) or 1.0; ox, oz = ox / l, oz / l; H = y1 - y0
    yb = y0 + (0.03 if tambor else 0.0)
    pts = curva([(x, y1, z), (x + ox * r * 0.6, y1 - H * 0.25, z + oz * r * 0.6), (x - ox * r * 0.3, y0 + H * 0.42, z - oz * r * 0.3), (x, yb + H * 0.16, z), (x + ox * r * 0.4, yb + r * 0.9, z + oz * r * 0.4)], 7)
    rs = [r * 0.95, r * 1.06, r * 0.82, r * 0.62, r * 0.64, r * 0.82, r * 0.9]
    tubo(M, part, pts, r, seg=7, caps=False, rs=rs)
    px, pz = x + ox * r * 0.45, z + oz * r * 0.45
    ovo(M, part, px, yb + r * 0.62, pz, r * 1.0, r * 0.62, seg=8, nv=4)
    if M.lod == 0:
        for k in (-1, 1):
            tx, tz = px + ox * r * 0.75 + (-oz) * k * r * 0.4, pz + oz * r * 0.75 + ox * k * r * 0.4
            ovo(M, part, tx, yb + r * 0.32, tz, r * 0.36, r * 0.3, seg=5, nv=3)
    if tambor: torno(M, tambor, [(y0, r * 1.05), (y0 + 0.03, r * 1.05)], seg=8, x=px, z=pz, cap0=False, cap1=True)

def assento_trancado(M, w, d, y, t=0.04, prt='palha', moldura='madeira', m=0.0, conc=0.012):
    """a woven seat in its frame: the rails round it (moldura) and the weave between, a little dished"""
    x0, x1, z0, z1 = -w / 2 + m, w / 2 - m, -d / 2 + m, d / 2 - m
    rr = 0.022
    for p, q in (((x0 + rr, z1 - rr), (x1 - rr, z1 - rr)), ((x0 + rr, z0 + rr), (x1 - rr, z0 + rr)), ((x0 + rr, z0 + rr), (x0 + rr, z1 - rr)), ((x1 - rr, z0 + rr), (x1 - rr, z1 - rr))):
        tubo(M, moldura, [(p[0], y - rr, p[1]), (q[0], y - rr, q[1])], rr, seg=7, caps=True)
    ax, az = (x1 - x0) / 2 - rr * 1.4, (z1 - z0) / 2 - rr * 1.4; cx, cz = (x0 + x1) / 2, (z0 + z1) / 2
    lamina(M, prt, lambda u, v: (cx - ax + 2 * ax * u, y - 0.006 - conc * math.sin(math.pi * u) * math.sin(math.pi * v), cz + az - 2 * az * v), 8, 8, uvs=(2 * ax, 2 * az))
    lamina(M, prt, lambda u, v: (cx - ax + 2 * ax * u, y - 0.03 - conc * math.sin(math.pi * u) * math.sin(math.pi * v), cz - az + 2 * az * v), 4, 4, uvs=(2 * ax, 2 * az))

def tampo_redondo(M, part, r, y0, y1, n=4, gap=0.005, seg=28, part_borda=None, so_topo=False):
    """a round top of n boards (their seams across it, front to back, a few millimetres apart), its round edge smooth; so_topo:
    only its top made (a cask's head, sunk in its staves: nothing else of it is ever seen)"""
    if M.lod > 0: n = 1; gap = 0.0; seg = 14
    P = M.p(part); L = 2 * r; wb = (L - gap * (n - 1)) / n
    for k in range(n):
        za = -r + k * (wb + gap); zb = za + wb
        # (the board's outline: the circle's arc on the right from z = za to zb, its arc on the left back down — the seams
        # between them, straight: the one at zb from the right arc's end to the left's start, the one at za closing it)
        th0 = math.asin(max(-1, min(1, za / r))); th1 = math.asin(max(-1, min(1, zb / r)))
        m = max(2, int(math.ceil(seg * (th1 - th0) / math.pi)))
        right = [(r * math.cos(th0 + (th1 - th0) * i / m), r * math.sin(th0 + (th1 - th0) * i / m)) for i in range(m + 1)]
        left = [(-x, z) for x, z in reversed(right)]
        cz = (za + zb) / 2
        for yy, ny in (((y1, 1),) if so_topo else ((y1, 1), (y0, -1))):
            c = P.v(M.tp((0, yy, cz)), M.tn((0, ny, 0)), (cz, 0))
            ids = [P.v(M.tp((x, yy, z)), M.tn((0, ny, 0)), (z, x)) for x, z in right + left]
            for i in range(len(ids)): P.tri(c, ids[i], ids[(i + 1) % len(ids)])
        if so_topo: continue
        def side(a, b, na, nb, u0):
            q = [P.v(M.tp((a[0], y0, a[1])), M.tn(na), (u0, 0)), P.v(M.tp((b[0], y0, b[1])), M.tn(nb), (u0 + 0.06, 0)),
                 P.v(M.tp((b[0], y1, b[1])), M.tn(nb), (u0 + 0.06, y1 - y0)), P.v(M.tp((a[0], y1, a[1])), M.tn(na), (u0, y1 - y0))]
            P.quad(*q)
        for arc in (right, left):
            for i in range(len(arc) - 1): side(arc[i], arc[i + 1], (arc[i][0] / r, 0, arc[i][1] / r), (arc[i + 1][0] / r, 0, arc[i + 1][1] / r), i * 0.06)
        if abs(right[-1][0]) > 1e-4: side(right[-1], left[0], (0, 0, 1), (0, 0, 1), 0)
        if abs(left[-1][0]) > 1e-4: side(left[-1], right[0], (0, 0, -1), (0, 0, -1), 0)
    if part_borda:
        torno(M, part_borda, [(y0 - 0.012, r - 0.012), (y0 - 0.0005, r - 0.004), (y0 - 0.0005, r - 0.03), (y0 - 0.012, r - 0.03)], seg=seg, cap0=False, cap1=False, sharp=40)

# ------------------------------ o banquinho (0,40 × 0,40 × 0,45: the seat on top, its top at h) ------------------------------
def banquinho(style):
    def tripe(M, w, d, h):
        # (the Norse milking stool: a thick round slab, three legs splayed through it and wedged on top)
        r = min(w, d) / 2 - 0.006; t = 0.055
        torno(M, 'madeira', [(h - t, r - 0.03), (h - t + 0.006, r - 0.008), (h - 0.01, r), (h - 0.002, r - 0.008), (h, r - 0.02)], seg=16, oval=0.97, sharp=50)
        for k in range(3):
            a = k * TAU / 3 + 0.4; ca, sa = math.cos(a), math.sin(a)
            top = (ca * 0.1, h - t + 0.01, sa * 0.1); foot = (ca * (r - 0.03), 0, sa * (r - 0.03) * 0.97)
            tubo(M, 'madeira2', [foot, tuple((foot[i] + top[i]) / 2 for i in range(3)), top], 0.02, seg=7, rs=[0.019, 0.022, 0.024])
            cilindro(M, 'madeira2', ca * 0.1, h - 0.001, sa * 0.1, 0.021, 0.004, seg=7)
    def romano(M, w, d, h):
        # (the Roman's square stool: four turned legs, the seat of two boards over its aprons, stretchers low between the legs)
        m = 0.035; L = quatro(w, d, m)
        for x, z in L: perna_torneada(M, 'madeira', x, z, 0, h - 0.035, 0.028, 'bulbo', seg=10)
        aventais(M, 'madeira', w, d, h - 0.11, h - 0.035, 0.022, m - 0.016)
        tampo(M, 'madeira', -w / 2 + 0.004, w / 2 - 0.004, -d / 2 + 0.004, d / 2 - 0.004, h - 0.035, h, 2, along='z', ch=0.008, seed=3)
        travessas(M, 'madeira2', L, 0.13, 0.012)
    def grego(M, w, d, h):
        # (the diphros: turned legs, a rush seat dished between its round rails)
        m = 0.03; L = quatro(w, d, m)
        for x, z in L: perna_torneada(M, 'madeira', x, z, 0, h - 0.012, 0.025, 'carretel', seg=10)
        assento_trancado(M, w - 0.012, d - 0.012, h, prt='palha')
        travessas(M, 'madeira2', L, 0.16, 0.011)
    def egipcio(M, w, d, h):
        # (the Egyptian stool: four legs braced by struts under a double-cove rush seat)
        m = 0.03; L = quatro(w, d, m)
        for x, z in L: poste(M, 'madeira', x, z, 0, h - 0.02, 0.034, 0.03)
        for x, z in (L if M.lod == 0 else []):
            tubo(M, 'madeira2', [(x * 0.92, 0.14, z * 0.92), (x * 0.5, h - 0.07, z * 0.5)], 0.009, seg=5)
        travessas(M, 'madeira2', L, 0.14, 0.011)
        assento_trancado(M, w - 0.01, d - 0.01, h, prt='palha', conc=0.025)
    def asteca(M, w, d, h):
        # (the woven drum seat — the equipal: two rings, slats crossed between them, a hide stretched over the top)
        r = min(w, d) / 2 - 0.012
        torno(M, 'madeira', [(0, r), (0.04, r), (0.04, r - 0.03), (0, r - 0.03)], seg=16, cap0=False, cap1=False, sharp=40)
        torno(M, 'madeira', [(h - 0.07, r * 0.86), (h - 0.035, r * 0.88), (h - 0.035, r * 0.86 - 0.03), (h - 0.07, r * 0.86 - 0.03)], seg=16, cap0=False, cap1=False, sharp=40)
        n = 10 if M.lod == 0 else 4
        for k in range(n):
            for s in ((-1, 1) if M.lod == 0 else (1,)):
                a0 = k * TAU / n; a1 = a0 + s * TAU / n * 1.5
                p = (math.cos(a0) * (r - 0.015), 0.035, math.sin(a0) * (r - 0.015)); q = (math.cos(a1) * (r * 0.86 - 0.015), h - 0.07, math.sin(a1) * (r * 0.86 - 0.015))
                tubo(M, 'palha' if s > 0 else 'madeira2', [p, q], 0.008, seg=4)
        torno(M, 'couro', [(h - 0.04, r * 0.88 + 0.004), (h - 0.012, r * 0.88 + 0.006), (h - 0.002, r * 0.8), (h, r * 0.5), (h, 0.0001)], seg=16, cap0=False, cap1=False, sharp=60)
    return {'tripe': tripe, 'romano': romano, 'grego': grego, 'egipcio': egipcio, 'asteca': asteca}[style]

# ------------------------------ a cadeira (0,50 × 0,50; the seat at 0,45, the back to 0,94) ------------------------------
def cadeira(style):
    def klismos(M, w, d, h):
        # (the Greek klismos: sabre legs splayed fore and aft, the back legs rising into the stiles, a broad curved back rail)
        hw = w / 2 - 0.035; zf, zb = d / 2 - 0.04, -d / 2 + 0.05
        for s in (-1, 1):
            tubo(M, 'madeira', curva([(s * hw, 0.0, d / 2 - 0.03), (s * hw, 0.2, d / 2 - 0.075), (s * hw, h - 0.04, zf - 0.03)], 7), 0.021, seg=7, rs=[0.016, 0.018, 0.02, 0.022, 0.023, 0.024, 0.024])
            tubo(M, 'madeira', curva([(s * hw, 0.0, -d / 2 + 0.03), (s * hw, 0.2, -d / 2 + 0.085), (s * hw, h - 0.04, zb), (s * hw, 0.72, zb - 0.005), (s * hw, 0.9, -d / 2 + 0.045)], 10), 0.021, seg=7)
        # (the back rail: a broad board bent round the sitter's back)
        pts = 8 if M.lod == 0 else 4
        def back(u, v):
            a = (u - 0.5) * 1.5; x = math.sin(a) * hw * 1.02; z = -d / 2 + 0.03 + (1 - math.cos(a)) * 0.09
            return (x, 0.76 + v * 0.16, z - v * 0.012)
        lamina(M, 'madeira', back, pts * 2, 2, both=True, uvs=(w, 0.16))
        assento_trancado(M, w - 0.03, d - 0.05, h, prt='palha')
        almofada(M, 'pano', (-hw + 0.02, h - 0.004, -d / 2 + 0.07), (hw - 0.02, h + 0.035, d / 2 - 0.05), e=0.3)
    def catedra(M, w, d, h):
        # (the Roman cathedra: turned legs, the seat board, the rounded back of one bent panel to the shoulders, a cushion)
        m = 0.035; L = quatro(w, d, m)
        for x, z in L: perna_torneada(M, 'madeira', x, z, 0, h - 0.04, 0.026, 'bulbo', seg=10)
        aventais(M, 'madeira', w, d, h - 0.12, h - 0.04, 0.022, m - 0.016)
        tampo(M, 'madeira', -w / 2 + 0.005, w / 2 - 0.005, -d / 2 + 0.005, d / 2 - 0.005, h - 0.04, h, 2, along='z', seed=5)
        r = w / 2 - 0.012; n = 12 if M.lod == 0 else 6
        def shell(u, v):
            a = math.pi * (0.08 + 0.84 * u); x = -math.cos(a) * r; z = -math.sin(a) * (d * 0.42) + d * 0.06
            top = 0.92 - 0.1 * (abs(u - 0.5) * 2) ** 2
            return (x, h + (top - h) * v, max(-d / 2 + 0.006, z))
        lamina(M, 'madeira', shell, n, 4, both=True, uvs=(w * 1.4, 0.5))
        tubo(M, 'madeira2', [shell(u / 10, 1.0) for u in range(11)], 0.012, seg=6)
        almofada(M, 'pano', (-w / 2 + 0.04, h - 0.002, -d / 2 + 0.06), (w / 2 - 0.04, h + 0.045, d / 2 - 0.03), e=0.3)
    def egipcio(M, w, d, h):
        # (the Egyptian chair: four lion's legs on their drums, a rush seat, the back of slats leaning back, braced behind)
        hw = w / 2 - 0.045; hd = d / 2 - 0.05
        for sx in (-1, 1):
            pata_leao(M, 'madeira', sx * hw, hd, 0, h - 0.035, 0.026, 0, 1, tambor='madeira2')
            pata_leao(M, 'madeira', sx * hw, -hd, 0, h - 0.035, 0.026, 0, 1, tambor='madeira2')
        assento_trancado(M, w - 0.04, d - 0.04, h, prt='palha', conc=0.02)
        zb0, zb1 = -d / 2 + 0.06, -d / 2 + 0.012
        for sx in (-1, 1):
            tubo(M, 'madeira', [(sx * (hw - 0.01), h - 0.02, zb0), (sx * (hw - 0.02), 0.93, zb1)], 0.016, seg=6)
            tubo(M, 'madeira2', [(sx * (hw - 0.02), 0.6, zb1 + 0.04), (sx * (hw - 0.02), h + 0.02, zb0 + 0.11)], 0.008, seg=5)
        n = 5 if M.lod == 0 else 3
        for k in range(n):
            x = -hw + 0.03 + (2 * hw - 0.06) * k / (n - 1)
            tubo(M, 'pintura' if k % 2 else 'madeira', [(x, h + 0.01, zb0 - 0.005), (x, 0.915, zb1 + 0.012)], 0.012, seg=5, oval=0.45)
        tubo(M, 'madeira', [(-hw - 0.01, 0.92, zb1 + 0.012), (hw + 0.01, 0.92, zb1 + 0.012)], 0.016, seg=6)
    def nordico(M, w, d, h):
        # (the Norse chair: square posts, the back posts rising to carved knobs, a plank seat, a carved board across the back)
        m = 0.03; s = 0.05
        for x, z in quatro(w, d, m + s / 2 - 0.022):
            top = 0.875 if z < 0 else h - 0.03
            caixa(M, 'madeira', (x - s / 2, 0, z - s / 2), (x + s / 2, top, z + s / 2), ch=0.008, grain='y')
            if z < 0: ovo(M, 'madeira', x, top + 0.02, z, 0.024, 0.03, seg=8)
        aventais(M, 'madeira2', w, d, h - 0.1, h - 0.03, 0.022, m + 0.012)
        tampo(M, 'madeira', -w / 2 + 0.01, w / 2 - 0.01, -d / 2 + 0.02, d / 2 - 0.006, h - 0.03, h, 3, along='z', seed=9)
        zb = -d / 2 + m + s / 2 - 0.022
        tabua(M, 'madeira', (-w / 2 + m + s, 0.6, zb - 0.014), (w / 2 - m - s, 0.82, zb + 0.014), grain='x', seed=7)
        tabua(M, 'madeira2', (-w / 2 + m + s, 0.48, zb - 0.012), (w / 2 - m - s, 0.53, zb + 0.012), grain='x', seed=8)
        travessas(M, 'madeira2', quatro(w, d, m + s / 2 - 0.022), 0.16, 0.013)
    def icpalli(M, w, d, h):
        # (the Aztec icpalli: a woven reed seat on a low frame, its tall back of reeds leaning back, bound to two posts)
        hw, hd = w / 2 - 0.02, d / 2 - 0.02
        caixa(M, 'madeira', (-hw, 0, -hd), (hw, 0.05, hd), ch=0.01)
        almofada(M, 'palha', (-hw + 0.01, 0.05, -hd + 0.01), (hw - 0.01, h, hd - 0.01), e=0.22)
        n = 9 if M.lod == 0 else 5
        for k in range(n):
            x = -hw + 0.02 + (2 * hw - 0.04) * k / (n - 1)
            tubo(M, 'palha', [(x, h - 0.04, -hd + 0.05), (x * 1.02, 0.915, -d / 2 + 0.013)], 0.013, seg=5)
        zb = lambda y: (-hd + 0.05) + ((-d / 2 + 0.013) - (-hd + 0.05)) * (y - (h - 0.04)) / (0.93 - (h - 0.04))
        for y in (0.62, 0.84):
            tubo(M, 'pintura', [(-hw, y, zb(y) - 0.012), (hw, y, zb(y) - 0.012)], 0.011, seg=5) if zb(y) - 0.024 > -d / 2 else tubo(M, 'pintura', [(-hw, y, zb(y) + 0.012), (hw, y, zb(y) + 0.012)], 0.011, seg=5)
        for s in (-1, 1): tubo(M, 'madeira', [(s * hw, 0.04, -hd + 0.06), (s * hw * 1.0, 0.92, -d / 2 + 0.014)], 0.014, seg=6)
    return {'klismos': klismos, 'catedra': catedra, 'egipcio': egipcio, 'nordico': nordico, 'icpalli': icpalli}[style]
