# mat_dentro: the materials of the insides (the interiors 2.0, the front P1 — D-703): the floors of a house and of a hall
# (the beaten earth swept smooth, the boards, the fired tiles of 30 cm, the stone flags worn by the feet — no grass in their
# joints indoors —, the Roman mosaic), the lime plaster of the walls and the painted frieze along them, the reed mat and the
# rug, and the stuff of the furniture and what is on it (planed wood light and dark, cast bronze, glazed and bare fired clay:
# the front P2's pieces read them by their own coordinates, M3UV). Same form as arte/texturas.py (joined by it): (name, maker,
# metres the picture covers, what it is[, options]). A floor's picture lies flat (nothing in it points anywhere); a wall's
# reads upward; a piece's grain runs up the picture. Each picture repeats without seams (only texlib's periodic tools). The
# colour of the world (the people's, the house's) multiplies the picture's own variation round its mean: a floor keeps the
# colour the 3D gives it and gains its grain, its joints, its wear.
import numpy as np
from texlib import *

S = 512

def _rows(seed, rows, lmin, lmax):
    """boards or flags in rows across the picture: each row its own run of pieces (lmin..lmax of the picture), the joints of a
    row kept from the row's before. Per pixel: the piece's id, where in it (fx along the row, fy across it), its length"""
    r = rng(seed); x, y = grid(S); row = np.minimum((y * rows).astype(int), rows - 1); fy = y * rows - row
    fx = np.zeros((S, S), np.float32); pid = np.zeros((S, S), np.int64); ln = np.zeros((S, S), np.float32); prev = None
    for k in range(rows):
        e = [0.0]
        while e[-1] < 1.0: e.append(e[-1] + r.uniform(lmin, lmax))
        e = np.array(e) / e[-1]; best, bo = -1, 0.0
        for t in range(24):
            off = r.random(); j = (e[:-1] + off) % 1.0
            if prev is None: bo = off; break
            dd = np.abs(((j[:, None] - prev[None, :]) + 0.5) % 1.0 - 0.5).min()
            if dd > best: best, bo = dd, off
        prev = (e[:-1] + bo) % 1.0
        m = row == k; xx = (x[m] - bo) % 1.0; b = np.clip(np.searchsorted(e, xx, side='right') - 1, 0, len(e) - 2)
        fx[m] = (xx - e[b]) / (e[b + 1] - e[b]); pid[m] = k * 256 + b; ln[m] = e[b + 1] - e[b]
    return pid, fx, fy.astype(np.float32), ln

def terra(seed=401):
    # beaten earth swept smooth (a house's floor, a tavern's): broad patches where it was wetted and beaten again, a fine grit,
    # the arcs the broom left, hair cracks of the drying, darker where the feet go most
    r = rng(seed); x, y = grid(S)
    n = fbm(S, 5, 5, seed); n2 = fbm(S, 40, 3, seed + 1); grit = value_noise(S, 220, seed + 2)
    col = mix(hexc('#8a6c4c'), hexc('#6e5236'), n) * (0.9 + n2[..., None] * 0.18)
    col = mix(col, col * np.array([1.08, 1.04, 0.96]), smooth(0.6, 0.8, fbm(S, 8, 3, seed + 3)) * 0.6)
    sw = []
    for k in range(40):
        cx, cy = r.random(), r.random(); R = r.uniform(0.18, 0.32); a0 = r.uniform(0, 2 * np.pi); da = r.uniform(0.6, 1.1)
        for q in range(8):
            pts = [(cx + np.cos(a0 + da * t / 12) * (R + q * 0.005), cy + np.sin(a0 + da * t / 12) * (R + q * 0.005)) for t in range(13)]
            sw += polyline_items(pts, r.uniform(0.2, 0.6), 0.6)
    sweep = blur(strokes(S, sw, 1.0), 1.4)
    crack = smooth(0.965, 0.995, ridged(S, 7, 3, seed + 4)) * smooth(0.55, 0.7, fbm(S, 4, 2, seed + 5))
    col = mix(col, col * 1.05, np.clip(sweep, 0, 1) * 0.3)
    col = col * (0.92 + grit[..., None] * 0.12)
    col = mix(col, col * 0.62, crack * 0.8)
    h = 0.5 + (n - 0.5) * 0.12 + grit * 0.06 + sweep * 0.04 - crack * 0.25
    col *= (0.92 + 0.1 * curv(h, 1.5, 5.0))[..., None]
    return col, h

def tabuado(seed=411):
    # a floor of boards indoors, along the picture's width: 16-24 cm each, warm and planed, each board its own tone and length,
    # the grain running with it, oak pegs where it lies on a joist, polished pale where the feet go, dark in its seams
    r = rng(seed); x, y = grid(S)
    rows = 12; pid, fx, fy, ln = _rows(seed, rows, 0.32, 0.7)
    tone = hash01(pid, seed + 1); gn = fbm(S, 3, 4, seed + 2, ny=24)
    fib = value_noise(S, 4, seed + 3, 320) * 0.6 + value_noise(S, 9, seed + 4, 140) * 0.4
    rings = np.sin((fy * 2.5 + gn * 7 + tone * 13) * np.pi * 2) * 0.5 + 0.5
    grain = 0.5 * rings + 0.5 * fib
    base = mix(hexc('#a67c52'), hexc('#7e5a3a'), tone); base = mix(base, hexc('#946a44'), hash01(pid, seed + 5) * 0.4)
    col = base * (0.84 + grain[..., None] * 0.26)
    worn = smooth(0.45, 0.8, fbm(S, 3, 3, seed + 6)); col = mix(col, col * np.array([1.12, 1.1, 1.06]), worn * 0.35)
    seam = smooth(0.0, 0.03, np.minimum(fy, 1 - fy)) * smooth(0.0, 0.006 / np.maximum(ln, 0.05), np.minimum(fx, 1 - fx))
    peg = np.zeros((S, S), np.float32)
    for k in range(rows):
        for jx in np.arange(0.0, 1.0, 1.0 / 5):
            for jy in (0.3, 0.7):
                d = np.sqrt(((((x - jx - 0.03 * k + 0.5) % 1) - 0.5) * 2.4) ** 2 + ((((y - (k + jy) / rows) + 0.5) % 1) - 0.5) ** 2)
                peg = np.maximum(peg, smooth(0.0045, 0.002, d))
    col = mix(col, col * 0.55, peg * 0.8)
    col = col * (0.42 + 0.58 * seam[..., None])
    h = (0.72 + (grain - 0.5) * 0.06 + np.sin(fy * np.pi) * 0.06) * seam + 0.08 * (1 - seam) - peg * 0.05
    return col, h

def lajota(seed=421):
    # fired tiles of 30 cm in a grid (the picture eight across), each its own tone of the kiln — orange, red, brown, a pale one
    # here and there —, the edges rounded, a chip, a hair crack, the mortar pale between them, worn darker where trodden
    r = rng(seed); x, y = grid(S); n = 8
    u, v = x * n, y * n; i = np.floor(u).astype(int); j = np.floor(v).astype(int); fu = u - i; fv = v - j; tid = (j % n) * n + (i % n)
    jo = 0.03; e = np.minimum(np.minimum(fu, 1 - fu), np.minimum(fv, 1 - fv))
    face = smooth(jo, jo + 0.045, e)
    tone = hash01(tid, seed + 1); t2 = hash01(tid, seed + 2)
    base = ramp(tone, [(0.0, '#b4602e'), (0.45, '#a24e2a'), (0.75, '#8c4a2c'), (1.0, '#c07a4a')])
    base = mix(base, hexc('#c89060'), (t2 > 0.9).astype(np.float32) * 0.6)
    spot = fbm(S, 24, 3, seed + 3); col = base * (0.86 + spot[..., None] * 0.26)
    chip = np.zeros((S, S), np.float32)
    for k in range(18):
        cx, cy = (r.integers(0, n) + r.choice([0.04, 0.96])) / n, (r.integers(0, n) + r.uniform(0.1, 0.9)) / n
        d = np.sqrt((((x - cx + 0.5) % 1) - 0.5) ** 2 + (((y - cy + 0.5) % 1) - 0.5) ** 2); chip = np.maximum(chip, smooth(0.012, 0.004, d))
    crack = smooth(0.975, 0.995, ridged(S, 16, 2, seed + 4)) * (hash01(tid, seed + 5) > 0.7)
    mortar = hexc('#b8aa94') * (0.9 + fbm(S, 60, 2, seed + 6)[..., None] * 0.15)
    col = mix(mortar, col, face * (1 - chip * 0.7)); col = mix(col, col * 0.6, crack * 0.7)
    worn = smooth(0.5, 0.85, fbm(S, 3, 3, seed + 7)); col = mix(col, col * np.array([0.82, 0.8, 0.82]), worn * 0.4)
    h = 0.2 + face * (0.55 + (spot - 0.5) * 0.08) - chip * 0.25 - crack * 0.2
    col *= (0.93 + 0.1 * curv(h, 1.5, 4.0))[..., None]
    return col, h

def lajes(seed=431):
    # stone flags laid in rows of their own lengths (40-80 cm), a pale limestone each of its own bed, smoothed by the feet to a
    # dull sheen, the joints tight and dark — swept clean: no grass grows indoors (the street's slabs keep theirs)
    r = rng(seed); x, y = grid(S)
    pid, fx, fy, ln = _rows(seed, 6, 0.14, 0.28)
    tone = hash01(pid, seed + 1); t2 = hash01(pid, seed + 2)
    base = mix(hexc('#b6ab96'), hexc('#9a9080'), tone); base = mix(base, hexc('#c2b496'), (t2 > 0.75) * 0.5)
    vein = smooth(0.93, 0.99, ridged(S, 6, 4, seed + 3)) * 0.5; mott = fbm(S, 16, 4, seed + 4)
    col = base * (0.88 + mott[..., None] * 0.2); col = mix(col, col * 0.8, vein)
    e = np.minimum(np.minimum(fx * ln * 6, (1 - fx) * ln * 6), np.minimum(fy, 1 - fy))
    face = smooth(0.0, 0.035, e)
    col = mix(hexc('#4a443c') * 0.9, col, face)
    stain = smooth(0.62, 0.8, fbm(S, 6, 3, seed + 5)) * 0.35; col = mix(col, col * np.array([0.86, 0.84, 0.8]), stain)
    h = 0.2 + face * (0.6 + (mott - 0.5) * 0.06) - (1 - face) * 0.1
    col *= (0.94 + 0.08 * curv(h, 1.2, 4.0))[..., None]
    return col, h

def mosaico(seed=441):
    # the Roman floor: little cubes of stone (a centimetre and some) in rows, white of marble and black of basalt, a red of
    # terracotta — a field of black lines in squares of 40 cm with a lozenge at each crossing and a red cross in each square —
    # each cube its own tone and a hair askew, the grout between them
    r = rng(seed); x, y = grid(S); n = 96
    jx, jy = wfield(S, 8, seed, 0.6 / n)
    u, v = (x + jx) * n, (y + jy) * n; i = np.floor(u).astype(int); j = np.floor(v).astype(int); fu = u - i; fv = v - j
    cid = (j % n) * n + (i % n); cu = (i % n + 0.5) / n; cv = (j % n + 0.5) / n
    # the drawing, read at each cube's middle: three squares a side
    q = 3; su = (cu * q) % 1.0; sv = (cv * q) % 1.0
    line = (np.minimum(su, 1 - su) < 0.035) | (np.minimum(sv, 1 - sv) < 0.035)
    du = np.abs(su - 0.0); du = np.minimum(du, 1 - su); dv = np.minimum(sv, 1 - sv)
    loz = (du + dv) < 0.12
    cr = ((np.abs(su - 0.5) < 0.04) & (np.abs(sv - 0.5) < 0.16)) | ((np.abs(sv - 0.5) < 0.04) & (np.abs(su - 0.5) < 0.16))
    white = hexc('#e6e0d2'); black = hexc('#2a2826'); red = hexc('#9a4a32')
    t = hash01(cid, seed + 1)
    col = np.where((line | loz)[..., None], black * (0.9 + t[..., None] * 0.25), np.where(cr[..., None], red * (0.88 + t[..., None] * 0.24), white * (0.9 + t[..., None] * 0.12)))
    e = np.minimum(np.minimum(fu, 1 - fu), np.minimum(fv, 1 - fv)); cube = smooth(0.06, 0.2, e)
    col = mix(hexc('#8a8274'), col, cube)
    dirt = fbm(S, 10, 3, seed + 2); col = col * (0.9 + dirt[..., None] * 0.14)
    h = 0.25 + cube * (0.55 + (t - 0.5) * 0.1)
    return col, h

def caiado(seed=451):
    # the lime plaster of a room, washed white again and again: the trowel's long smooth sweeps under the wash, the brush's
    # strokes in it, a cloud of a thinner coat where the old shows through, a pit, a hair crack
    r = rng(seed); x, y = grid(S)
    n = fbm(S, 4, 5, seed); sw = fbm(S, 3, 3, seed + 1, ny=14); br = value_noise(S, 3, seed + 2, 90) * 0.5 + value_noise(S, 7, seed + 3, 200) * 0.5
    col = mix(hexc('#ece6da'), hexc('#ded4c2'), n) * (0.95 + sw[..., None] * 0.07) * (0.97 + br[..., None] * 0.05)
    thin = smooth(0.62, 0.78, fbm(S, 6, 4, seed + 4)); col = mix(col, col * np.array([0.92, 0.88, 0.82]), thin * 0.45)
    pits = []
    for k in range(260): pits.append((r.random(), r.random(), r.uniform(0.0015, 0.004), r.uniform(0.0015, 0.004), r.uniform(0, 3), 1.0))
    _, pc = stamp_ellipses(S, pits); col = mix(col, col * 0.84, pc * 0.6)
    crack = smooth(0.982, 0.997, ridged(S, 5, 3, seed + 5)) * smooth(0.6, 0.72, fbm(S, 3, 2, seed + 6)); col = mix(col, col * 0.7, crack * 0.6)
    h = 0.55 + (sw - 0.5) * 0.08 + (br - 0.5) * 0.03 - pc * 0.15 - crack * 0.2
    return col, h

def friso(seed=461):
    # the painted band along a room's wall, a picture as long as 1.2 m and as tall as the band (the shader stretches it over the
    # band from its foot: Build3D's anchored frieze) — a dark rule at its top and foot, a running wave of scrolls between two thin
    # rules, a little leaf in each curl. Light and dark only: the people's colour comes from the 3D (Pompeii's red, Egypt's blue)
    x, y = grid(S)
    yy = y  # (0 at the band's top in the picture, 1 at its foot)
    rule = ((yy < 0.07) | (yy > 0.93)).astype(np.float32); thin = ((np.abs(yy - 0.17) < 0.018) | (np.abs(yy - 0.83) < 0.018)).astype(np.float32)
    k = 4  # (four scrolls in the picture's length)
    ph = (x * k) % 1.0; vv = (yy - 0.5) / 0.3
    wave = 0.55 * np.sin(ph * 2 * np.pi); dw = np.abs(vv - wave)
    curl = np.zeros((S, S), np.float32)
    for c, s in ((0.25, 1), (0.75, -1)):
        dx = (ph - c) * 2.2; dy = vv - s * 0.25; rr = np.sqrt(dx * dx + dy * dy); a = np.arctan2(dy, dx)
        sp = np.abs(((rr - 0.06 * (a * s + np.pi) / (2 * np.pi) - 0.02) % 0.12) - 0.06)
        curl = np.maximum(curl, smooth(0.03, 0.012, sp) * smooth(0.42, 0.3, rr))
    leaf = np.zeros((S, S), np.float32)
    for c, s in ((0.25, 1), (0.75, -1)):
        dx = (ph - c) * 2.2; dy = vv - s * 0.25; leaf = np.maximum(leaf, smooth(0.08, 0.05, np.sqrt((dx * 1.6) ** 2 + dy * dy)))
    motif = np.clip(np.maximum(smooth(0.09, 0.05, dw) * (np.abs(vv) < 0.9), curl), 0, 1)
    ground = 0.48 + fbm(S, 12, 3, seed)[..., None] * 0.06
    col = np.ones((S, S, 3), np.float32) * ground
    col = mix(col, np.array([0.92, 0.9, 0.86]), motif * 0.9); col = mix(col, np.array([0.8, 0.8, 0.78]), leaf * 0.7)
    col = mix(col, np.array([0.16, 0.15, 0.14]), np.clip(rule + thin, 0, 1))
    brush = value_noise(S, 160, seed + 1, 4); col *= (0.95 + brush[..., None] * 0.08)
    h = 0.5 + motif * 0.03
    return col, h

def esteira(seed=471):
    # a mat of reeds plaited over and under in a twill — the strips flat and wide, each its own straw, a dyed one in a band now
    # and then, worn in the middle where one sits
    h, which, ids = weave(S, 34, 34, 'twill', seed, slub=0.15, gap=0.12)
    tone = hash01(ids, seed + 1); col = mix(hexc('#c8a86a'), hexc('#a8884e'), tone)
    band = ((ids % 4096) % 11 == 3) & (which == 0); col = mix(col, hexc('#7a4a2e'), band.astype(np.float32) * 0.7)
    fib = value_noise(S, 34, seed + 2, 400); col = col * (0.86 + fib[..., None] * 0.2) * (0.62 + 0.38 * h[..., None])
    worn = smooth(0.5, 0.8, fbm(S, 2, 3, seed + 3)); col = mix(col, col * 1.08, worn * 0.4)
    return col, h * 0.8 + 0.1

def tapete(seed=481):
    # a woven rug's field: rows of stepped lozenges in two colours on a third, a small hook in each, the knots of the pile
    # and its wear — the colours light and dark of their own; the house's dyes come from the 3D
    x, y = grid(S); k = 4
    u = (x * k) % 1.0; v = (y * k) % 1.0; du = np.abs(u - 0.5); dv = np.abs(v - 0.5)
    step = np.floor((du + dv) * 10) / 10
    loz = step < 0.36; inner = step < 0.18; hook = (np.abs(du - dv) < 0.03) & (du + dv > 0.38) & (du + dv < 0.48)
    a = hexc('#8e4434'); b = hexc('#3e4c62'); c = hexc('#a08c6c')
    col = np.where(loz[..., None], np.where(inner[..., None], c, b), a); col = np.where(hook[..., None], c, col)
    h, which, ids = weave(S, 120, 120, 'plain', seed, slub=0.05, gap=0.06)
    knots = value_noise(S, 160, seed + 1); col = col * (0.82 + knots[..., None] * 0.22) * (0.8 + 0.2 * h[..., None])
    worn = smooth(0.55, 0.85, fbm(S, 3, 3, seed + 2)); col = mix(col, col * np.array([1.1, 1.05, 1.0]) * 0.95, worn * 0.35)
    return col, 0.4 + h * 0.3 + knots * 0.1

def _wood(seed, light, dark):
    # planed wood for a piece, its grain up the picture: the long fibres, the growth rings waving across them, a ray fleck now
    # and then, the oil darker in the pores
    x, y = grid(S)
    gn = fbm(S, 2, 4, seed, ny=1); fib = value_noise(S, 160, seed + 1, 3) * 0.6 + value_noise(S, 340, seed + 2, 6) * 0.4
    rings = np.sin((x * 18 + gn * 2.5 + fbm(S, 3, 3, seed + 3, ny=2) * 0.8) * np.pi * 2) * 0.5 + 0.5
    rings = smooth(0.2, 0.9, rings)
    fleck = smooth(0.8, 0.95, value_noise(S, 60, seed + 4, 8)) * 0.3
    col = mix(hexc(light), hexc(dark), rings * 0.55 + fib * 0.3) * (1 + fleck[..., None] * 0.12)
    pore = smooth(0.7, 0.9, value_noise(S, 220, seed + 5, 18)); col = mix(col, col * 0.75, pore * 0.4)
    h = 0.55 + (fib - 0.5) * 0.08 - pore * 0.05
    return col, h

def madeira(): return _wood(491, '#b8905e', '#8a6038')
def madeira2(): return _wood(495, '#6a4a30', '#3e2818')

def bronze(seed=501):
    # cast and hammered bronze: the gold-brown of the metal, the dimples of the hammer catching the light, the dark of age in
    # the hollows and a green bloom of patina in them
    r = rng(seed); x, y = grid(S)
    f1, f2, ids, _, _ = voronoi(S, 14, seed, 0.9)
    dim = np.clip(1 - f1 * 1.6, 0, 1) ** 2; tone = hash01(ids, seed + 1)
    col = mix(hexc('#b0843e'), hexc('#8c6430'), tone * 0.6 + fbm(S, 6, 3, seed + 2) * 0.4)
    edge = smooth(0.08, 0.0, f2 - f1); col = mix(col, col * 0.7, edge * 0.5)
    pat = smooth(0.55, 0.75, fbm(S, 8, 4, seed + 3)) * (0.4 + edge * 0.6); col = mix(col, hexc('#4a7a62'), pat * 0.55)
    col *= (0.86 + dim[..., None] * 0.22)
    h = 0.5 + dim * 0.15 - edge * 0.1
    return col, h

def vidrado(seed=511):
    # a glazed pot's skin: the glaze pooled darker where it ran thick down the piece, the drips, the fine crackle of its cooling,
    # a pin-hole here and there
    r = rng(seed); x, y = grid(S)
    run = value_noise(S, 16, seed, 2) * 0.6 + fbm(S, 8, 3, seed + 1, ny=2) * 0.4
    col = mix(hexc('#d8d0b8'), hexc('#9aa88a'), smooth(0.3, 0.8, run))
    f1, f2, _, _, _ = voronoi(S, 22, seed + 2, 0.95); crk = smooth(0.035, 0.0, f2 - f1) * 0.5
    col = mix(col, col * 0.72, crk)
    pin = []
    for k in range(60): pin.append((r.random(), r.random(), 0.003, 0.003, 0, 1.0))
    _, pc = stamp_ellipses(S, pin); col = mix(col, col * 0.6, pc * 0.6)
    h = 0.6 + (run - 0.5) * 0.05 - crk * 0.04
    return col, h

def barro(seed=521):
    # bare fired clay: the rings the potter's fingers left round the piece (across the picture), the grit of its temper, a scorch
    # of the kiln
    x, y = grid(S)
    rings = np.sin((y * 34 + fbm(S, 2, 3, seed, ny=4) * 3) * np.pi * 2) * 0.5 + 0.5
    grit = value_noise(S, 260, seed + 1); scorch = smooth(0.6, 0.85, fbm(S, 3, 3, seed + 2))
    col = mix(hexc('#b46c42'), hexc('#9a5636'), fbm(S, 6, 3, seed + 3)) * (0.9 + rings[..., None] * 0.1) * (0.9 + grit[..., None] * 0.16)
    col = mix(col, col * np.array([0.6, 0.55, 0.52]), scorch * 0.5)
    h = 0.5 + rings * 0.06 + grit * 0.05
    return col, h

MATS = [
    ('terra', terra, 3.0, 'chão de terra batida de casa: liso, varrido (os arcos da vassoura), manchas de onde foi molhado e batido de novo, grão fino, trincas finas, mais escuro onde se pisa'),
    ('tabuado', tabuado, 2.4, 'soalho de tábuas de dentro (16-24 cm), aplainadas, cada uma do seu tom e comprimento, cavilhas sobre os barrotes, gasto e claro onde se pisa'),
    ('lajota', lajota, 2.4, 'lajotas de barro cozido de 30 cm, cada uma da sua fornada, quinas arredondadas, lascas, argamassa clara'),
    ('lajes', lajes, 3.0, 'lajes de pedra de dentro (40-80 cm), calcário claro alisado pelos pés, juntas finas e escuras — sem capim (o capim é da rua)'),
    ('mosaico', mosaico, 1.2, 'mosaico romano: tésseras de mármore branco, basalto preto e barro vermelho, linhas em quadrados de 40 cm com losangos e cruzes, rejunte', {'q': 72}),
    ('caiado', caiado, 3.0, 'reboco de cal de dentro, caiado de novo e de novo: as passadas da colher, as pinceladas, demão fina, poros, trincas'),
    ('friso', friso, 1.2, 'faixa pintada na parede (a altura da figura é a da faixa: o 3D a estica do pé): onda de volutas entre filetes, claro e escuro — a cor é do povo', {'q': 84}),
    ('esteira', esteira, 1.2, 'esteira de junco trançada em sarja, tiras largas, uma tingida de vez em quando, gasta no meio', {'q': 80}),
    ('tapete', tapete, 1.6, 'tapete de lã: campo de losangos em degrau de duas cores sobre uma terceira, ganchos, os nós do pelo, gasto', {'px': 256}),
    ('madeira', madeira, 1.0, 'madeira aplainada clara de móvel, veio para cima: fibras, anéis, raios, poros escurecidos de óleo', {'px': 256}),
    ('madeira2', madeira2, 1.0, 'madeira escura de móvel (encerada), veio para cima', {'px': 256}),
    ('bronze', bronze, 0.5, 'bronze fundido e batido: covinhas do martelo, o escuro da idade nos fundos, pátina verde', {'px': 256}),
    ('vidrado', vidrado, 0.6, 'barro vidrado: o esmalte escorrido, as gotas, o craquelado, um furinho', {'px': 256}),
    ('barro', barro, 0.6, 'barro cozido sem vidrado: os anéis do torno, o grão do tempero, uma queimada do forno', {'px': 256}),
]
