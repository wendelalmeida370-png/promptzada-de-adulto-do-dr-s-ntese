# mat_objetos: the materials of the things a town is full of — a door of planks with its ironwork, the timber of a frame,
# wrought iron, the cloths (linen, canvas, wool), rope, leather, fur, wicker. Same form as arte/texturas.py (joined by
# it): (name, maker, metres the picture covers, what it is). A thing's own coordinates: the picture's top is up.
import numpy as np
from texlib import *

S = 512

def _grain(seed, x, y, along_y=True, rings=3.0):
    """wood grain along the picture's height: long fibres, rings that wave"""
    u, v = (x, y) if along_y else (y, x)
    gn = fbm(S, 6, 4, seed, 0.55, ny=1) if along_y else fbm(S, 1, 4, seed, 0.55, ny=6)
    fib = value_noise(S, 140, seed + 1, 3) * 0.6 + value_noise(S, 300, seed + 2, 6) * 0.4 if along_y else value_noise(S, 3, seed + 1, 140) * 0.6 + value_noise(S, 6, seed + 2, 300) * 0.4
    ring = np.sin((u * rings * 10 + gn * 6) * np.pi * 2) * 0.5 + 0.5
    return 0.55 * ring + 0.45 * fib

def door(seed=301):
    # (two leaves of a plank door side by side, a metre each — the picture's left half is one door, the right half
    # another: four boards to a leaf, three straps of iron from the hinge side with split, curled ends, nail heads along
    # them, a ring to pull; the straps at 0.3, 1.0 and 1.7 m, so the door reads the same either way up)
    r = rng(seed); x, y = grid(S)
    leaf = (x >= 0.5).astype(int); lx = (x - leaf * 0.5) / 0.5   # (0..1 across the leaf, from its hinge side on the left leaf)
    nb = 4; bi = np.floor(lx * nb).astype(int); bu = lx * nb - bi; bid = leaf * 8 + np.clip(bi, 0, nb - 1)
    gr = _grain(seed + 1, x, y)
    tone = hash01(bid, seed + 2)
    wood = mix(hexc('#8a6644'), hexc('#6e5034'), tone)
    wood = wood * (0.84 + gr[..., None] * 0.28)
    gap = smooth(0.0, 0.035, np.minimum(bu, 1 - bu)); edge = smooth(0.0, 0.01, np.minimum(lx, 1 - lx))
    col = wood * (0.52 + 0.48 * gap[..., None]) * (0.74 + 0.26 * edge[..., None])   # (gaps and leaf edges in shade, not black)
    h = (0.55 + 0.1 * np.sin(np.pi * bu) + (gr - 0.5) * 0.06) * (0.4 + 0.6 * gap)
    # the straps (from the hinge: the left leaf's from the left, the right leaf's from the right)
    hx = np.where(leaf == 0, lx, 1 - lx)     # (0 at the hinge)
    iron = np.zeros((S, S), np.float32); nails = np.zeros((S, S), np.float32)
    for yc in (0.15, 0.5, 0.85):
        th = 0.027                            # (5.4 cm)
        reach = 0.8
        dy = np.abs(y - yc)
        body = (dy < th / 2 * (1 - 0.35 * smooth(reach - 0.12, reach, hx))) & (hx < reach)
        # (the split end: two curls out from the strap's tip)
        for sd in (-1, 1):
            cxr = reach + 0.012; cyr = yc + sd * 0.024
            d = np.sqrt(((hx - cxr) * 0.5) ** 2 + (y - cyr) ** 2)
            ang = np.arctan2((y - cyr) * sd, (hx - cxr) * 0.5)
            curl = (np.abs(d - 0.017) < 0.0055) & (ang < 0.9) & (hx > reach - 0.03)
            body = body | curl
        iron = np.maximum(iron, body.astype(np.float32))
        for k in range(7):
            nxp = 0.05 + k * 0.11
            if nxp > reach - 0.04: break
            d = np.sqrt(((hx - nxp) * 0.5) ** 2 + (y - yc) ** 2); nails = np.maximum(nails, smooth(0.006, 0.003, d))
    # (the ring to pull, on the side away from the hinge, with its round plate)
    for lf in (0, 1):
        cx = 0.5 * lf + (0.42 if lf == 0 else 0.08); cy = 0.5
        d = np.sqrt((x - cx) ** 2 + (y - cy - 0.035) ** 2)
        plate = smooth(0.022, 0.019, np.sqrt((x - cx) ** 2 + (y - cy) ** 2))
        ring = smooth(0.006, 0.003, np.abs(d - 0.032)) * (y > cy - 0.004)
        iron = np.maximum(iron, np.maximum(plate, ring))
    iron = blur(iron, 0.5)
    rust = smooth(0.55, 0.8, fbm(S, 20, 3, seed + 3))
    icol = mix(hexc('#3c3c40'), hexc('#5a4030'), rust * 0.5) * (0.85 + fbm(S, 60, 2, seed + 4)[..., None] * 0.3)
    col = mix(col, icol, iron)
    col = mix(col, hexc('#56565a'), nails * 0.9)
    h = np.maximum(h, iron * 0.82) + nails * 0.12
    k = curv(h, 1.5, 5.0)
    col *= (0.94 + 0.1 * k)[..., None] * (0.82 + 0.18 * ao(h, 2, 3.0))[..., None]
    return col, h

def frame(seed=311):
    # (the timber of a door frame, a window, a lintel: planed and oiled, a straight close grain up the picture — turn it
    # for a lintel —, a small knot now and then, the faint ripples of the plane, darker where hands have touched it)
    r = rng(seed); x, y = grid(S)
    gr = _grain(seed, x, y, rings=4.5)
    col = mix(hexc('#86603e'), hexc('#6a4a30'), gr) * (0.95 + (value_noise(S, 3, seed + 3, 40) - 0.5)[..., None] * 0.06)
    ripple = np.sin((y * 34 + fbm(S, 4, 3, seed + 4) * 2) * np.pi * 2) * 0.5 + 0.5
    kmap = np.zeros((S, S), np.float32)
    for k in range(3):
        kx, ky, rr = r.random(), r.random(), r.uniform(0.008, 0.014)
        dx = ((x - kx + 0.5) % 1) - 0.5; dy = (((y - ky + 0.5) % 1) - 0.5) * 0.4
        kmap = np.maximum(kmap, np.exp(-((dx * dx + dy * dy) ** 0.5 / rr) ** 2))
    col = mix(col, col * np.array([0.6, 0.48, 0.38]), kmap * 0.8)
    col = mix(col, col * 0.82, smooth(0.55, 0.8, fbm(S, 3, 4, seed + 5))[..., None] * 0.5)
    h = 0.6 + (gr - 0.5) * 0.06 + ripple * 0.02 - kmap * 0.04
    k = curv(h, 1.5, 6.0)
    col *= (0.96 + 0.06 * k)[..., None]
    return col, h

def iron(seed=321):
    # (wrought iron: dark, a little mottled by the forge's scale, dimpled by the hammer, a bloom of rust in the hollows
    # and here and there, the high points rubbed bright)
    r = rng(seed); x, y = grid(S)
    n = fbm(S, 5, 4, seed); scale = fbm(S, 14, 3, seed + 1)
    dv, dc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.012, 0.03), r.uniform(0.01, 0.024), r.uniform(0, 3), r.uniform(0.5, 1)) for _ in range(260)])
    dimple = blur(dc * dv, 3.0)
    col = mix(hexc('#424248'), hexc('#36363a'), smooth(0.35, 0.75, scale)) * (0.93 + n[..., None] * 0.14)
    h = 0.6 - dimple * 0.22 + (n - 0.5) * 0.08 + (scale - 0.5) * 0.03
    cav = np.clip((1 - ao(h, 3, 5.0)) * 1.5, 0, 1)
    rust = np.clip(smooth(0.62, 0.8, fbm(S, 8, 4, seed + 2)) * 0.7 + cav * 0.6, 0, 1)
    col = mix(col, mix(hexc('#5e3a24'), hexc('#7a4a2c'), value_noise(S, 120, seed + 3)), rust[..., None] * 0.45)
    k = curv(h, 2.5, 6.0)
    col = mix(col, hexc('#626268'), np.clip(k, 0, 1)[..., None] * 0.35)
    col *= (0.96 + 0.06 * k)[..., None]
    return col, h

def linen(seed=331):
    # (homespun linen, the threads a little uneven: a tabby weave with its slubs, the undyed grey-beige of flax; the folds
    # are the body's, not the picture's)
    h, which, ids = weave(S, 80, 80, 'plain', seed, slub=0.3, gap=0.3)
    tn = hash01(ids, seed + 1)
    col = mix(hexc('#ddd4c2'), hexc('#cec4ae'), tn) * (0.9 + h[..., None] * 0.14)
    mot = fbm(S, 4, 4, seed + 3)
    col = col * (0.97 + (mot[..., None] - 0.5) * 0.06)
    return col, 0.3 + h * 0.45 + (mot - 0.5) * 0.06

def canvas(seed=341):
    # (heavy canvas for awnings, tents and sails: a coarse tabby, seams sewn every half metre up the picture with their
    # two lines of stitches, a patch sewn on, water marks, dirt)
    r = rng(seed); x, y = grid(S)
    h, which, ids = weave(S, 128, 128, 'plain', seed, slub=0.2, gap=0.14)
    tn = hash01(ids, seed + 1)
    col = mix(hexc('#d8ccb0'), hexc('#c8ba98'), tn) * (0.88 + h[..., None] * 0.18)
    seam = np.zeros((S, S), np.float32); stitch = np.zeros((S, S), np.float32)
    for sx in (0.25, 0.75):
        d = np.abs(x - sx); seam = np.maximum(seam, smooth(0.012, 0.0, d))
        for off in (-0.007, 0.007):
            st = (np.abs(x - sx - off) < 0.0018) & ((y * 90) % 1.0 < 0.6); stitch = np.maximum(stitch, st.astype(np.float32))
    # (a patch sewn on)
    px0, py0, pw, ph = 0.42, 0.3, 0.18, 0.22
    inside = (x > px0) & (x < px0 + pw) & (y > py0) & (y < py0 + ph)
    pedge = np.minimum(np.minimum(x - px0, px0 + pw - x), np.minimum(y - py0, py0 + ph - y))
    pst = inside & (np.abs(pedge - 0.008) < 0.0018) & ((((x + y) * 90) % 1.0) < 0.6)
    col = np.where(inside[..., None], col * np.array([0.94, 0.95, 0.97]), col)
    stitch = np.maximum(stitch, pst.astype(np.float32))
    stain = smooth(0.58, 0.78, fbm(S, 5, 4, seed + 2)); dirt = smooth(0.6, 0.8, fbm(S, 9, 3, seed + 3))
    col = col * (1 - stain[..., None] * 0.07) * (1 - dirt[..., None] * 0.05)
    col = mix(col, col * 0.78, seam[..., None] * 0.4)
    col = mix(col, hexc('#8a7a5a'), stitch[..., None] * 0.6)
    hh = 0.3 + h * 0.45 + seam * 0.12 + inside * 0.04 + stitch * 0.05
    k = curv(hh, 1.5, 4.0)
    col *= (0.96 + 0.06 * k)[..., None]
    return col, hh

def wool(seed=351):
    # (woollen cloth as the northern weavers made it: a herringbone twill — diagonal ribs that turn every couple of
    # centimetres —, the yarn fuzzy and heathered, felted soft)
    r = rng(seed); x, y = grid(S)
    nt = 120; band = 10                                     # (threads across; threads to a band of the herringbone)
    wx, wy = wfield(S, 5, seed + 9, 0.004)
    u = (x + wx) * nt; v = (y + wy) * nt; bi = np.floor(u / band).astype(int)
    sgn = np.where(bi % 2 == 0, 1.0, -1.0)
    t = (u + sgn * v) / 2.0                                  # (along the rib: two threads to a step)
    rib = 0.5 + 0.5 * np.cos(np.pi * 2 * t / 2.0)
    seam = smooth(0.0, 0.12, np.abs(((u / band) % 1.0) - 0.5) * 2 - 0.88) * 0 + smooth(0.92, 1.0, np.abs(((u / band) % 1.0) - 0.5) * 2)
    thread = 0.5 + 0.5 * np.cos(np.pi * 2 * u) * 0.5 + 0.5 * np.cos(np.pi * 2 * v) * 0.5
    h = 0.35 + rib * 0.3 + thread * 0.06 - seam * 0.08
    tn = hash01(np.floor(u).astype(int) % nt, seed + 1); heather = value_noise(S, 220, seed + 2)
    col = mix(hexc('#86766a'), hexc('#706256'), tn * 0.5 + heather * 0.5) * (0.86 + rib[..., None] * 0.2)
    fuzz = []
    for k in range(6000):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, 2 * np.pi); L = r.uniform(0.002, 0.006)
        fuzz.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), 0.5))
    fz = strokes(S, fuzz, 0.8)
    felt = fbm(S, 5, 4, seed + 3)
    col = col * (1 + (fz[..., None] - 0.3) * 0.1) * (0.96 + (felt[..., None] - 0.5) * 0.08)
    h = blur(h, 0.6) + fz * 0.05 + (felt - 0.5) * 0.05
    return col, h

def rope(seed=361):
    # (laid rope: three strands twisting round, each of yarns twisting the other way, fibres standing out; one picture
    # is the three strands once round — wrap it round a rope, along it at the same scale)
    r = rng(seed); x, y = grid(S)
    t = (x + y) * 3; si = np.floor(t).astype(int) % 3; ft = t - np.floor(t)
    prof = np.sin(np.pi * ft) ** 0.6
    yarn = np.sin(((x - y) * 22 + ft * 2.5) * np.pi * 2) * 0.5 + 0.5
    tone = np.array([0.0, 0.5, 1.0])[si]
    col = mix(hexc('#a88e64'), hexc('#94784e'), tone) * (0.78 + prof[..., None] * 0.3) * (0.92 + yarn[..., None] * 0.12)
    fib = []
    for k in range(2500):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, 2 * np.pi); L = r.uniform(0.004, 0.012)
        fib.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), 0.5))
    fz = strokes(S, fib, 0.8)
    col = col * (1 + (fz[..., None] - 0.3) * 0.12)
    h = 0.15 + prof * 0.6 + yarn * 0.08 * prof + fz * 0.04
    col *= (0.8 + 0.2 * ao(h, 3, 2.0))[..., None]
    return col, h

def leather(seed=371):
    # (tanned leather: a fine pebbled grain, creases where it bends, worn lighter on the high places, a scratch or two,
    # darker where oil and hands have been)
    r = rng(seed); x, y = grid(S)
    g1, g2, gid, _, _ = voronoi(S, 110, seed, 0.9)
    peb = smooth(0.0, 0.25, g2 - g1)
    wx, wy = wfield(S, 4, seed + 1, 0.08)
    crease = smooth(0.86, 0.97, warp(ridged(S, 14, 2, seed + 2), wx + 0.5, wy + 0.5, 1.0)) * smooth(0.4, 0.7, fbm(S, 5, 3, seed + 4))
    crease = blur(crease, 0.7) * 0.6
    n = fbm(S, 6, 4, seed + 5); wear = smooth(0.5, 0.8, fbm(S, 4, 4, seed + 6))
    col = mix(hexc('#86583a'), hexc('#6e4630'), n) * (0.92 + peb[..., None] * 0.1)
    col = mix(col, col * np.array([1.18, 1.14, 1.08]), wear[..., None] * 0.5)
    col = mix(col, col * 0.75, smooth(0.6, 0.85, fbm(S, 5, 4, seed + 7))[..., None] * 0.4)
    sc = []
    for k in range(14):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); L = r.uniform(0.03, 0.09)
        sc.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, 1.0, 0.6))
    scr = strokes(S, sc, 1.0)
    col = mix(col, col * 1.25, scr[..., None] * 0.5)
    col = col * (1 - crease[..., None] * 0.22)
    h = 0.5 + peb * 0.08 - crease * 0.2 + (n - 0.5) * 0.12 - scr * 0.04
    k = curv(h, 1.5, 6.0)
    col *= (0.95 + 0.08 * k)[..., None]
    return col, h

def fur(seed=381):
    # (a pelt: long locks of hair lying down the picture and over each other, each lock its own sweep, each hair dark at
    # the root and pale at the tip, the dark under-fur showing a little between them)
    r = rng(seed); x, y = grid(S)
    flow = fbm(S, 3, 3, seed)
    hairs = []
    for k in range(520):                                   # (the locks)
        lx, ly = r.random(), r.random(); la = np.pi / 2 + (flow[int(ly * S) % S, int(lx * S) % S] - 0.5) * 1.2; lw = r.uniform(0.012, 0.024)
        lv = r.uniform(0.55, 1.0); bend = r.normal(0, 0.06)
        for q in range(22):                                # (the hairs of a lock: from its root, fanning a little)
            off = r.normal(0, lw * 0.5); x0 = lx + np.cos(la + np.pi / 2) * off; y0 = ly + np.sin(la + np.pi / 2) * off
            a = la + r.normal(0, 0.05); L = r.uniform(0.08, 0.14); pts = [(x0, y0)]
            for s_ in range(5): a += bend + r.normal(0, 0.03); pts.append((pts[-1][0] + np.cos(a) * L / 5, pts[-1][1] + np.sin(a) * L / 5))
            hairs += [(pts[s_][0], pts[s_][1], pts[s_ + 1][0], pts[s_ + 1][1], lv * (0.4 + 0.15 * s_), r.uniform(0.5, 0.9)) for s_ in range(5)]
    hm = strokes(S, hairs, 1.2)
    under = fbm(S, 40, 3, seed + 1); lock = fbm(S, 12, 4, seed + 2)
    col = mix(hexc('#4e3a2c'), hexc('#8e6e4e'), np.clip(hm, 0, 1)) * (0.92 + lock[..., None] * 0.16)
    col = mix(col, col * np.array([1.15, 1.1, 1.0]), smooth(0.75, 1.0, hm)[..., None] * 0.45)
    cov = smooth(0.05, 0.3, blur(hm, 1.2))
    col = mix(hexc('#3e3024') * (0.9 + under[..., None] * 0.2), col, cov[..., None])
    h = 0.15 + np.clip(hm, 0, 1) * 0.5 + cov * 0.15 + (lock - 0.5) * 0.1
    col *= (0.86 + 0.14 * ao(h, 2, 2.0))[..., None]
    return col, h

def wicker(seed=391):
    # (wicker: willow rods woven over and under upright stakes — for baskets, and laid big for the woven fences and walls
    # of a northern town; each rod its own shade, some with the bark on, some peeled)
    r = rng(seed); x, y = grid(S)
    ns = 15; nr = 56
    sx = x * ns; si = np.floor(sx).astype(int); fx = sx - si
    ry = y * nr + (value_noise(S, 4, seed, 1) - 0.5) * 0.6; ri = np.floor(ry).astype(int); fy = ry - ri
    over = ((si + ri) % 2) == 0                       # (the rod passes in front of this stake)
    rod_p = np.sin(np.pi * fy) ** 0.5
    stake_p = np.sin(np.pi * np.clip((fx - 0.3) / 0.4, 0, 1)) ** 0.5
    bulge = np.where(over, 0.75 + 0.25 * np.sin(np.pi * fx), 0.55 + 0.25 * np.abs(np.cos(np.pi * fx)))
    rod_h = rod_p * bulge
    behind = (~over) & (np.abs(fx - 0.5) < 0.2)       # (where the rod goes behind the stake, the stake shows)
    h = np.where(behind, np.maximum(stake_p * 0.85, rod_h * 0.5), rod_h)
    rid = ri % nr; tone = hash01(rid, seed + 1); peeled = hash01(rid, seed + 2) > 0.6
    rcol = np.where(peeled[..., None], mix(hexc('#b2946a'), hexc('#a2845c'), tone), mix(hexc('#8e6a46'), hexc('#7a5834'), tone))   # (peeled paler, not glaring)
    scol = mix(hexc('#7a5a3a'), hexc('#6a4c30'), hash01(si % ns, seed + 3))
    fib = value_noise(S, 6, seed + 4, 300) * 0.5 + 0.5
    col = np.where(behind[..., None], scol, rcol) * (0.9 + fib[..., None] * 0.15)
    col = col * (0.56 + 0.44 * np.clip(h / 0.8, 0, 1))[..., None]
    col *= (0.8 + 0.2 * ao(h, 2, 2.5))[..., None]
    return col, 0.12 + h * 0.75

MATS = [
    ('door', door, 2.0, 'porta de pranchas (duas folhas de 1 m lado a lado) com ferragens: dobradiças de cinta com pontas enroladas, pregos, argola'),
    ('frame', frame, 1.0, 'madeira de batente/moldura: aplainada, veio reto e fechado para cima (gire para uma verga)'),
    ('iron', iron, 0.5, 'ferro forjado: escuro, carepa da forja, marcas do martelo, ferrugem nas cavidades'),
    ('linen', linen, 0.15, 'linho caseiro: tafetá de fios irregulares (1,9 mm), nós de fio', {'px': 256}),
    ('canvas', canvas, 1.0, 'lona: tafetá grosso, costuras a cada meio metro, um remendo, manchas de água'),
    ('wool', wool, 0.4, 'lã em espinha de peixe (sarja), fio felpudo e mesclado', {'px': 256}),
    ('rope', rope, 0.2, 'corda torcida de três pernas (uma figura = as três pernas uma volta)'),
    ('leather', leather, 0.4, 'couro curtido: grão miúdo, vincos, gasto nas partes altas, arranhões', {'px': 256}),
    ('fur', fur, 0.4, 'pele com pelo: mechas deitadas para baixo, raiz escura e ponta clara', {'px': 256}),
    ('wicker', wicker, 0.6, 'vime trançado em estacas (cestos; em escala maior, cercas e paredes trançadas)'),
]
