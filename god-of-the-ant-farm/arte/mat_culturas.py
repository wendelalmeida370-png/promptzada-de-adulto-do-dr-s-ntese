# mat_culturas: the materials of the other peoples (arte/ESTUDIO.md §6, the fifth wave — what Hedeby learnt, taken to the
# others): the classical and the Roman (dressed stone, marble, the flat tile and its round cover), the Greek (whitewash
# over rubble, painted boards), the Egyptian (mud brick, sandstone) and the Aztec (burnished stucco, the red volcanic
# stone) — the Egyptian's painted plaster is the stucco too. Same form as arte/texturas.py (joined by it): (name, maker,
# metres the picture covers, what it is[, options]). A wall's picture is read upside down (nothing in it has a direction);
# a roof's top is its ridge; a thing's top is up. Each picture repeats without seams (only texlib's periodic tools).
import numpy as np
from texlib import *

S = 512

def _courses(seed, rows, lmin, lmax, hvar=0.0, yw=None):
    """blocks laid in courses: each course its own height (±hvar of the mean), each block its own length (lmin..lmax of
    the picture), each course slid so that its joints keep as far as they can from the joints of the course below (and
    the last from the first: the picture repeats). Per pixel: the block's id, where in it (fx along, fy across the
    course, both 0..1) and its size (picture units); yw: a periodic warp of the courses (a hand-laid wall waves a little)"""
    r = rng(seed); x, y = grid(S)
    if yw is not None: y = (y + yw) % 1.0
    hs = 1 + r.uniform(-hvar, hvar, rows); hs = hs / hs.sum(); yb = np.concatenate([[0.0], np.cumsum(hs)])
    row = np.clip(np.searchsorted(yb, y, side='right') - 1, 0, rows - 1)
    fy = (y - yb[row]) / hs[row]
    fx = np.zeros((S, S), np.float32); bid = np.zeros((S, S), np.int64); bw = np.zeros((S, S), np.float32)
    first = prev = None
    for k in range(rows):
        edges = [0.0]
        while edges[-1] < 1.0: edges.append(edges[-1] + r.uniform(lmin, lmax))
        e = np.array(edges) / edges[-1]
        best, bo = -1.0, 0.0
        for t in range(32):
            off = r.random(); j = (e[:-1] + off) % 1.0
            if prev is None: bo = off; break
            dd = np.abs(((j[:, None] - prev[None, :]) + 0.5) % 1.0 - 0.5).min()
            if k == rows - 1: dd = min(dd, np.abs(((j[:, None] - first[None, :]) + 0.5) % 1.0 - 0.5).min())
            if dd > best: best, bo = dd, off
        prev = (e[:-1] + bo) % 1.0
        if first is None: first = prev
        m = row == k; xx = (x[m] - bo) % 1.0
        b = np.clip(np.searchsorted(e, xx, side='right') - 1, 0, len(e) - 2)
        fx[m] = (xx - e[b]) / (e[b + 1] - e[b]); bid[m] = k * 256 + b; bw[m] = e[b + 1] - e[b]
    return bid, fx, fy, bw, hs[row].astype(np.float32)

def _inside(fx, fy, bw, bh, M, rc):
    """how far inside its block a point is, in metres, the block's corners rounded by rc"""
    dx = np.minimum(fx, 1 - fx) * bw * M; dy = np.minimum(fy, 1 - fy) * bh * M
    return np.where((dx < rc) & (dy < rc), rc - np.hypot(rc - dx, rc - dy), np.minimum(dx, dy)), dx, dy

def _cracks(seed, n, keep, patch, width=0.012):
    """hairline cracks: the edges of warped cells, only some of them, fading in and out (as the plaster's)"""
    wx, wy = wfield(S, 6, seed, 0.05)
    f1, f2, ids, _, _ = voronoi(S, n, seed + 1, 0.95, dx=wx, dy=wy)
    return smooth(width, 0.0, f2 - f1) * (hash01(ids, seed + 2) > keep) * smooth(patch, patch + 0.15, fbm(S, 7, 3, seed + 3))

def _arc_items(r, n, rad, span, val, wid):
    """the sweeps of a trowel: arcs of a circle as strokes() items (wrapping)"""
    items = []
    for k in range(n):
        cx, cy = r.random(), r.random(); R = r.uniform(*rad); a0 = r.uniform(0, 2 * np.pi); sp = r.uniform(*span)
        t = np.linspace(a0, a0 + sp, 9); v = r.uniform(*val); w = r.uniform(*wid)
        pts = [(cx + np.cos(q) * R, cy + np.sin(q) * R) for q in t]
        items += polyline_items(pts, v, w)
    return items

# ---------------------------------------------------------------- the classical and the Roman
def ashlar(seed=401):
    # (cantaria: blocks of dressed stone in courses — the Roman's opus quadratum, the Greek's and the Egyptian's walls,
    # the base of a temple: each block its own stone, a margin drafted smooth round its edge and the field inside dressed
    # with the point (fine pecks) or, on some, the claw (fine parallel scores); joints of lime mortar a few millimetres
    # wide; the arrises chipped here and there; dirt and lichen in soft patches; nothing with a direction)
    M = 2.4; x, y = grid(S)
    bid, fx, fy, bw, bh = _courses(seed, 6, 0.17, 0.34, hvar=0.18)
    wob = (fbm(S, 48, 3, seed + 1) - 0.5) * 0.006            # (the arris wanders a few millimetres)
    d, dx, dy = _inside(fx, fy, bw, bh, M, 0.012); d = d + wob
    chip = smooth(0.56, 0.7, fbm(S, 22, 4, seed + 2)) * smooth(0.055, 0.0, d)
    J = 0.004
    face = smooth(J, J + 0.004, d)
    arris = smooth(J, J + 0.022, d) ** 0.6
    field = smooth(0.038, 0.05, d)                            # (0 in the drafted margin, 1 in the field)
    claw_on = hash01(bid, seed + 3) > 0.62; a = np.where(hash01(bid, seed + 4) > 0.5, 1, -1)
    claw = (np.sin((x * 70 + a * y * 70 + fbm(S, 8, 2, seed + 5) * 0.8) * 2 * np.pi) * 0.5 + 0.5) * smooth(0.3, 0.7, fbm(S, 24, 3, seed + 17)) * 0.7
    pecks = smooth(0.6, 0.8, value_noise(S, 150, seed + 6)) * 0.6 + smooth(0.62, 0.82, value_noise(S, 230, seed + 7)) * 0.4
    dress = np.where(claw_on, claw * 0.6, pecks) * field
    tone = hash01(bid, seed + 8)
    base = ramp(tone, [(0, '#b9b2a4'), (0.3, '#c3bba9'), (0.55, '#b3ad9f'), (0.8, '#c8bea8'), (1, '#aaa498')])
    base = base * (0.91 + hash01(bid, seed + 9)[..., None] * 0.15) * np.where((hash01(bid, seed + 18) > 0.9)[..., None], 0.88, 1.0)
    mott = fbm(S, 5, 4, seed + 10); grain = value_noise(S, 260, seed + 11)
    col = base * (0.95 + mott[..., None] * 0.1) * (0.98 + (grain[..., None] - 0.5) * 0.05)
    col = col * (1.0 + (1 - field)[..., None] * 0.025) * (1 - dress[..., None] * 0.06)
    mortar = hexc('#c4bcaa') * (0.9 + fbm(S, 40, 2, seed + 12)[..., None] * 0.15)
    col = mix(mortar, col, face)
    col = mix(col, col * 1.06, chip * 0.8)                    # (the fresh stone under a chip, paler)
    dirt = smooth(0.55, 0.8, fbm(S, 4, 4, seed + 13)); col = mix(col, col * np.array([0.9, 0.885, 0.86]), dirt * 0.5)
    lich = smooth(0.7, 0.76, fbm(S, 14, 4, seed + 14)) * face; col = mix(col, hexc('#a9ad96'), lich * 0.32)
    dots = smooth(0.76, 0.82, fbm(S, 34, 3, seed + 15)) * face; col = mix(col, col * 0.8, dots * 0.35)
    h = 0.2 + face * (0.42 + arris * 0.1 + (hash01(bid, seed + 16) - 0.5) * 0.04 + (mott - 0.5) * 0.04 + field * 0.015 - dress * 0.035) - chip * 0.12
    k = curv(h, 2.0, 5.0)
    col *= (0.965 + 0.05 * k)[..., None] * (0.82 + 0.18 * ao(h, 3, 2.5))[..., None]
    return col, h

def marble(seed=411):
    # (marble in big blocks — the Greek's base and column drums, the Roman's facing, the steps of a temple: a white stone
    # with soft grey veins, each block cut from its own part of the quarry, the bed joints a fine line and the upright ones
    # finer still (a column's drums have none), the polish gone matt and honey-coloured where the weather reached it, the
    # sugar of its crystals catching the light)
    M = 2.4; r = rng(seed); x, y = grid(S)
    bid, fx, fy, bw, bh = _courses(seed, 4, 0.36, 0.58)
    dx = np.minimum(fx, 1 - fx) * bw * M; dy = np.minimum(fy, 1 - fy) * bh * M
    jh = smooth(0.0012, 0.003, dy); jv = smooth(0.0006, 0.002, dx)
    face = jh * (0.45 + 0.55 * jv)
    # the veins: lines where a warped noise crosses its middle, sharp and branching, with a soft halo; each block reads
    # the vein field from its own offset
    # (|sin| of a line across the picture, bent by noise: whole-number slopes, so the picture still repeats)
    t1 = x * 1 + y * 2 + fbm(S, 2, 6, seed + 1) * 2.4
    t2 = x * 3 - y * 1 + fbm(S, 3, 5, seed + 2) * 1.8
    t3 = x * 5 + y * 4 + fbm(S, 4, 4, seed + 3) * 2.0
    s1 = 1 - np.abs(np.sin(np.pi * t1)); s2 = 1 - np.abs(np.sin(np.pi * t2)); s3 = 1 - np.abs(np.sin(np.pi * t3))
    m1 = smooth(0.28, 0.55, fbm(S, 4, 3, seed + 13))
    v1 = (s1 ** 16 * 0.55 + s1 ** 70 * 0.45) * m1
    v2 = s2 ** 60 * smooth(0.42, 0.62, fbm(S, 5, 3, seed + 14)) * 0.6 + s3 ** 110 * smooth(0.48, 0.66, fbm(S, 6, 3, seed + 15)) * 0.35
    # (the drift: a broad soft grey band carrying each vein, wider and narrower as it goes, a cloud here and there)
    wide = 1.5 + 2.5 * fbm(S, 3, 3, seed + 16)
    cloud = s1 ** wide * (0.45 + 0.55 * m1) * 0.85 + s2 ** 5 * 0.3 + smooth(0.55, 0.85, fbm(S, 3, 5, seed + 4)) * 0.25
    V = np.stack([v1, v2, cloud], -1).astype(np.float32)
    ox = hash01(bid, seed + 5) * S; oy = hash01(bid, seed + 6) * S
    Vb = sample(V, x * S + ox, y * S + oy)
    vein = np.clip(Vb[..., 0] + Vb[..., 1], 0, 1); halo = blur(vein, 4.0); cl = np.clip(Vb[..., 2], 0, 1)
    tone = hash01(bid, seed + 7)
    base = mix(hexc('#ecebe6'), hexc('#e9e2d2'), tone * 0.8)
    col = base * (0.985 + (fbm(S, 12, 3, seed + 8)[..., None] - 0.5) * 0.03)
    col = mix(col, hexc('#c6c9cd'), smooth(0.15, 0.9, cl) * 0.6)
    col = mix(col, hexc('#b9bcc1'), np.clip(halo * 2.0, 0, 1) * 0.35)
    col = mix(col, hexc('#9a9ea5'), vein * 0.45)
    patina = smooth(0.5, 0.8, fbm(S, 3, 4, seed + 9)); col = mix(col, col * np.array([1.0, 0.975, 0.92]), patina * 0.5)
    spark = smooth(0.86, 0.95, value_noise(S, 380, seed + 10)); col = col * (1 + spark[..., None] * 0.05)
    col = mix(hexc('#b8b2a4'), col, face)
    corner = smooth(0.55, 0.7, fbm(S, 26, 3, seed + 11)) * smooth(0.03, 0.0, np.minimum(dx, dy))
    col = mix(col, col * 0.93, corner * 0.6)
    h = 0.28 + face * (0.34 + (fbm(S, 6, 3, seed + 12) - 0.5) * 0.02 - vein * 0.012 + (spark - 0.5) * 0.004) - corner * 0.08
    k = curv(h, 2.0, 5.0)
    col *= (0.97 + 0.05 * k)[..., None] * (0.86 + 0.14 * ao(h, 3, 2.5))[..., None]
    return col, h

def tegula(seed=421):
    # (the Roman roof: broad flat tiles with a raised flange down each side — the tegulae — and over each pair of flanges
    # a tapered half-round cover — the imbrex —, so the roof reads as strong round ribs running down it with flat channels
    # between. The picture's top is the ridge (half a metre to a column, half a metre to a course). Each tile its own
    # fired tone, a newer one put back here and there, the lap of each course a thin shadow, dirt washed down the
    # channels, lichen on the crowns of the ribs, moss where they meet the channels)
    r = rng(seed); x, y = grid(S); cols = 4; rows = 4
    cx = x * cols; ci = np.floor(cx).astype(int); u = cx - ci
    du = np.minimum(u, 1 - u); rib = (ci + (u >= 0.5)) % cols
    ry = y * rows + (hash01(np.asarray(ci % cols), seed + 1) - 0.5) * 0.06
    row = np.floor(ry).astype(int); fy = ry - row                      # (0 under the lap of the tile above, 1 at the lip)
    iy = y * rows * 1.25 + hash01(np.asarray(rib), seed + 2) * 0.5
    irow = np.floor(iy).astype(int); fyi = iy - irow                   # (the covers: shorter, their own courses)
    wi = 0.17 * (0.86 + 0.28 * fyi)                                    # (the cover widens toward its foot)
    cov = smooth(wi, wi - 0.025, du)
    prof = np.sqrt(np.clip(1 - (du / wi) ** 2, 0, 1))
    flange = smooth(wi + 0.06, wi + 0.03, du) * (1 - cov)
    tid = (row % rows) * 32 + ci % cols; iid = (irow % 5) * 32 + rib + 16
    # heights: the channel rises a little down each tile (its foot rests on the one below), the flange stands at its
    # side, the cover is round and laps over the next
    hp = 0.18 + 0.1 * fy + flange * 0.1
    hc = 0.46 + 0.44 * prof + 0.05 * fyi
    h = mix(hp, hc, cov)
    n = fbm(S, 24, 4, seed + 3)
    base_t = ramp(hash01(tid, seed + 4), [(0, '#9e4c36'), (0.4, '#b05a3c'), (0.75, '#bc6644'), (0.92, '#8c5440'), (1, '#c6744c')])
    base_c = ramp(hash01(iid, seed + 5), [(0, '#a2503a'), (0.5, '#b86242'), (0.85, '#98523c'), (1, '#c87a50')])
    col_t = base_t * (0.9 + n[..., None] * 0.18) * (0.62 + 0.38 * smooth(0.0, 0.12, fy))[..., None]
    col_t = mix(col_t, col_t * 1.06, smooth(0.86, 0.98, fy) * 0.5)
    col_c = base_c * (0.92 + n[..., None] * 0.16) * (0.9 + 0.12 * prof)[..., None] * (0.7 + 0.3 * smooth(0.0, 0.12, fyi))[..., None]
    col = mix(col_t, col_c, cov)
    # (dirt down the channels, darkest at each tile's foot and along the covers' edges, where the water runs)
    dirt = smooth(0.4, 0.75, fbm(S, 9, 3, seed + 6)) * (1 - cov) * (0.4 + 0.6 * fy) * (0.6 + 0.4 * smooth(wi + 0.15, wi, du))
    col = mix(col, hexc('#5c4a38'), dirt * 0.3)
    moss = smooth(0.58, 0.72, fbm(S, 8, 4, seed + 7)) * smooth(wi + 0.07, wi, du) * (1 - cov * 0.7)
    col = mix(col, hexc('#6e7a42'), moss * 0.45)
    lich = smooth(0.64, 0.74, fbm(S, 16, 3, seed + 8)) * smooth(0.55, 0.75, value_noise(S, 180, seed + 9)) * cov * smooth(0.3, 0.8, prof)
    col = mix(col, hexc('#d0c8a2'), lich * 0.45)
    k = curv(h, 2.0, 5.0)
    col *= (0.95 + 0.08 * k)[..., None] * (0.78 + 0.22 * ao(h, 4, 2.2))[..., None]
    return col, h

# ---------------------------------------------------------------- the Greek
def whitewash(seed=431):
    # (the islanders' walls: rubble stone under coat after coat of whitewash — the lumps of the stones still show, every
    # edge gone soft and round; the brush every way; where the last coat flaked, the greyer one under it, a small step at
    # its edge; hairline cracks; the hollows a little cool, never dirty; nothing that runs: the wall's picture is laid
    # upside down)
    r = rng(seed); x, y = grid(S)
    wx, wy = wfield(S, 5, seed, 0.07)
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 1, 0.85, ny=9, stretch=(1.0, 1.4), dx=wx, dy=wy, jy=0.4)
    lump = smooth(0.0, 0.32, f2 - f1) ** 0.7 * (0.75 + hash01(ids, seed + 2) * 0.5)
    lump = blur(lump, 5.0)
    items = []
    for k in range(1500):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); L = r.uniform(0.02, 0.07)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), r.uniform(2.0, 5.0)))
    br = blur(strokes(S, items, 1.0), 1.4)
    flake = smooth(0.64, 0.665, fbm(S, 9, 5, seed + 3))
    crack = _cracks(seed + 4, 7, 0.6, 0.55)
    fine = fbm(S, 70, 3, seed + 5); grain = value_noise(S, 300, seed + 6)
    col = hexc('#f2f0ea') * (0.985 + (fbm(S, 6, 3, seed + 7)[..., None] - 0.5) * 0.03)
    col = col * (0.99 + (br[..., None] - 0.5) * 0.02) * (0.99 + (grain[..., None] - 0.5) * 0.02)
    col = mix(col, hexc('#e3e1da'), flake * 0.8)
    col = col * (1 - crack[..., None] * 0.22)
    h = 0.4 + lump * 0.4 + br * 0.025 - flake * 0.03 - crack * 0.1 + (fine - 0.5) * 0.02 + (grain - 0.5) * 0.015
    a_ = ao(h, 6, 3.0)
    col = mix(col * np.array([0.92, 0.945, 0.985]), col, a_)            # (cool in the hollows)
    k = curv(h, 3.0, 4.0)
    col *= (0.975 + 0.04 * k)[..., None]
    return col, h

def painted(seed=441):
    # (painted boards — the Greek's blue doors, shutters and balconies, the painted trim of every people: planks under coat
    # over coat of paint, the brush along the grain, the grain still felt through the film; the paint worn off the boards'
    # edges and chipped here and there to the paler coat under it, and in the deepest chips to the grey wood; fine cracks
    # where the sun baked it; the same either way up. 1.2 m of boards side by side, 13 to 17 cm each)
    r = rng(seed); x, y = grid(S)
    edges = [0.0]
    while edges[-1] < 1.0: edges.append(edges[-1] + r.uniform(0.11, 0.14))
    edges = np.array(edges) / edges[-1]; nb = len(edges) - 1
    b = np.clip(np.searchsorted(edges, x, side='right') - 1, 0, nb - 1)
    u = (x - edges[b]) / (edges[b + 1] - edges[b]); bwid = (edges[b + 1] - edges[b])
    fib = value_noise(S, 140, seed + 1, 3) * 0.6 + value_noise(S, 300, seed + 2, 6) * 0.4
    ring = np.sin((u * 3 + fbm(S, 6, 4, seed + 3, ny=1) * 6 + hash01(b, seed + 4) * 20) * np.pi * 2) * 0.5 + 0.5
    grain = 0.5 * ring + 0.5 * fib
    items = []
    for k in range(2600):
        x0, y0 = r.random(), r.random(); a = np.pi / 2 + r.normal(0, 0.02); L = r.uniform(0.08, 0.3)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.2, 1.0), r.uniform(0.6, 1.6)))
    brush = blur(strokes(S, items, 1.0), 0.6)
    edge = np.minimum(u, 1 - u) * bwid * 1.2          # (metres to the board's edge)
    gap = smooth(0.0, 0.004, edge)
    wear = smooth(0.7, 0.76, fbm(S, 18, 4, seed + 5) + smooth(0.015, 0.0, edge) * 0.3)
    chips = []
    for k in range(36):
        cx, cy = r.random(), r.random(); n = 8; R = r.uniform(0.004, 0.012)
        chips.append(([(cx + np.cos(t) * R * r.uniform(0.5, 1.4) * 0.6, cy + np.sin(t) * R * r.uniform(0.5, 1.4)) for t in np.linspace(0, 2 * np.pi, n, endpoint=False)], 1))
    _, cc = stamp_polys(S, chips); cc = blur(cc, 0.5)
    deep = cc * smooth(0.45, 0.6, value_noise(S, 60, seed + 6)) + wear * smooth(0.7, 0.78, fbm(S, 30, 3, seed + 7)) * 0.8
    deep = np.clip(deep, 0, 1); old = np.clip(np.maximum(wear, cc) - deep, 0, 1)
    craq = _cracks(seed + 8, 40, 0.3, 0.6, 0.02)
    paint = np.ones((S, S, 3), np.float32) * hexc('#c8c4bc') * (0.97 + (brush[..., None] - 0.5) * 0.05) * (0.97 + (grain[..., None] - 0.5) * 0.05)
    col = mix(paint, paint * 1.15, old * 0.85)                            # (the older coat, paler)
    wood = mix(hexc('#8a8478'), hexc('#6e665a'), grain) * np.array([1.06, 1.0, 0.92])
    col = mix(col, wood * 0.82, deep * 0.9)
    col = col * (1 - craq[..., None] * 0.2)
    col = col * (0.42 + 0.58 * gap[..., None])
    for k in range(nb):
        for yy in (0.1, 0.9):
            nx = (edges[k] + edges[k + 1]) / 2; d = np.sqrt((((x - nx + 0.5) % 1) - 0.5) ** 2 + (((y - yy + 0.5) % 1) - 0.5) ** 2)
            col = mix(col, col * 0.55, smooth(0.0045, 0.003, d))
    h = (0.6 + 0.06 * np.sin(np.pi * u) + (grain - 0.5) * 0.03 + brush * 0.012 - old * 0.02 - deep * 0.05 - craq * 0.03) * (0.4 + 0.6 * gap)
    k = curv(h, 1.5, 5.0)
    col *= (0.95 + 0.08 * k)[..., None] * (0.86 + 0.14 * ao(h, 2, 3.0))[..., None]
    return col, h

# ---------------------------------------------------------------- the Egyptian
def adobe(seed=451):
    # (the Nile's houses: big sun-dried bricks of mud and chopped straw (about 40 × 14 cm), soft at the edges, no two the
    # same size, laid by hand in courses that wave, in a thick mud mortar a shade darker; over most of the wall a render of
    # the same mud, smoothed by hand and cracked as it dried, worn through in patches down to the bricks, its edge a small
    # crumbling step; straw in everything; the same either way up)
    M = 2.4; r = rng(seed); x, y = grid(S)
    yw = (value_noise(S, 6, seed, 1) - 0.5) * 0.012 + (value_noise(S, 17, seed + 1, 2) - 0.5) * 0.004
    bid, fx, fy, bw, bh = _courses(seed + 2, 16, 0.12, 0.19, hvar=0.14, yw=yw)
    wob = (fbm(S, 30, 3, seed + 3) - 0.5) * 0.014 + (hash01(bid, seed + 4) - 0.5) * 0.01
    d, dx, dy = _inside(fx, fy, bw, bh, M, 0.03); d = d + wob
    J = 0.013
    brick = smooth(J, J + 0.012, d)
    dome = smooth(J, J + 0.06, d) ** 0.5
    straw_items = []
    for k in range(3200):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); L = r.uniform(0.004, 0.012)
        straw_items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.5, 1.0), r.uniform(0.6, 1.1)))
    straw = strokes(S, straw_items, 1.0)
    pores = smooth(0.7, 0.85, value_noise(S, 200, seed + 5)) * smooth(0.5, 0.7, value_noise(S, 40, seed + 6))
    rm = fbm(S, 4, 5, seed + 7) + (fbm(S, 26, 3, seed + 8) - 0.5) * 0.16
    render = smooth(0.475, 0.5, rm)
    rim = np.clip(smooth(0.45, 0.475, rm) - render, 0, 1)
    rcrack = _cracks(seed + 9, 9, 0.35, 0.45, 0.01) * render
    hand = blur(strokes(S, _arc_items(r, 220, (0.03, 0.08), (0.5, 1.4), (0.3, 1.0), (5.0, 10.0)), 1.0), 1.5)
    n = fbm(S, 20, 4, seed + 10); n2 = fbm(S, 60, 3, seed + 11)
    tone = hash01(bid, seed + 12)
    bcol = ramp(tone, [(0, '#9c8466'), (0.35, '#a88e6c'), (0.65, '#958064'), (1, '#ac9474')]) * (0.92 + n[..., None] * 0.16)
    mortar = hexc('#8a755a') * (0.9 + n2[..., None] * 0.15)
    col = mix(mortar, bcol, brick)
    rcol = mix(hexc('#ab9373'), hexc('#a08a6c'), smooth(0.3, 0.7, fbm(S, 6, 3, seed + 13))) * (0.96 + n2[..., None] * 0.08) * (0.98 + (hand[..., None] - 0.5) * 0.05)
    col = mix(col, rcol, np.maximum(render, rim * 0.6))
    col = col * (1 - rcrack[..., None] * 0.22)
    col = mix(col, col * np.array([1.16, 1.1, 0.96]), straw * 0.5)
    col = col * (1 - pores[..., None] * 0.18 * (1 - render[..., None]))
    hb = 0.22 + brick * (0.2 + dome * 0.2 + (n - 0.5) * 0.06) - pores * 0.04
    hr = 0.64 + (fbm(S, 8, 3, seed + 14) - 0.5) * 0.05 + hand * 0.012 + (n2 - 0.5) * 0.02 - rcrack * 0.08
    h = mix(hb, hr, render) + rim * (0.5 - hb) * 0.5 + straw * 0.015
    k = curv(h, 2.0, 5.0)
    col *= (0.96 + 0.05 * k)[..., None] * (0.8 + 0.2 * ao(h, 3, 2.2))[..., None]
    return col, h

def sandstone(seed=461):
    # (sandstone blocks — the temples of the Nile, the base of an Egyptian house: big blocks in courses, their shoulders
    # rounded by the wind, the joints worn wide; beds of sand across each block, of uneven thickness and strength (each
    # block its own, a little tilted where the bedding crossed), the softer beds eaten back; a honeycomb of small hollows
    # on some; a band of iron, warmer, now and then; nothing with a direction)
    M = 3.0; r = rng(seed); x, y = grid(S)
    bid, fx, fy, bw, bh = _courses(seed, 5, 0.26, 0.48, hvar=0.15)
    wob = (fbm(S, 26, 3, seed + 1) - 0.5) * 0.02
    d, dx, dy = _inside(fx, fy, bw, bh, M, 0.05); d = d + wob
    J = 0.006
    face = smooth(J, J + 0.012, d)
    sh = smooth(J, J + 0.07, d) ** 0.8
    # (the beds: a random strength per bed, eased from one to the next, in the block's own frame — its phase and tilt)
    ph = hash01(bid, seed + 2) * 40; tilt = (hash01(bid, seed + 3) - 0.5) * 0.3
    lt = (fy * bh * M + tilt * fx * bw * M) * 9 + ph + (fbm(S, 6, 3, seed + 4) - 0.5) * 1.2
    Tb = rng(seed + 5).random(97).astype(np.float32)
    i = np.floor(lt).astype(int); t = lt - i; t = t * t * (3 - 2 * t)
    band = Tb[i % 97] * (1 - t) + Tb[(i + 1) % 97] * t
    l2 = lt * 3.3; i2 = np.floor(l2).astype(int); t2 = l2 - i2
    fine_b = Tb[(i2 * 7) % 97] * (1 - t2) + Tb[(i2 * 7 + 7) % 97] * t2
    beds = band * 0.75 + fine_b * 0.25
    hon = []
    for k in range(900):
        hon.append((r.random(), r.random(), r.uniform(0.002, 0.006), r.uniform(0.002, 0.005), r.uniform(0, 3), 1))
    _, hc = stamp_ellipses(S, hon)
    hon_m = smooth(0.55, 0.65, fbm(S, 6, 4, seed + 6)) * (hash01(bid, seed + 7) > 0.55)
    pits = np.clip(hc * hon_m, 0, 1); prim = np.clip(blur(pits, 1.5) - pits, 0, 1)
    tone = hash01(bid, seed + 8)
    base = ramp(tone, [(0, '#c9a878'), (0.35, '#d2b088'), (0.6, '#c09c70'), (0.85, '#cba590'), (1, '#d8bc94')])
    n = fbm(S, 14, 4, seed + 9); grain = value_noise(S, 300, seed + 10)
    col = base * (0.94 + n[..., None] * 0.12) * (0.98 + (grain[..., None] - 0.5) * 0.05)
    col = col * (0.92 + beds[..., None] * 0.15)
    iron_b = smooth(0.82, 0.95, band) * (hash01(bid, seed + 11) > 0.45)
    col = mix(col, col * np.array([1.05, 0.97, 0.9]), iron_b * 0.5)
    col = mix(col, col * 0.74, pits * 0.8); col = col * (1 + prim[..., None] * 0.05)
    joint = hexc('#a88c66') * (0.88 + n[..., None] * 0.15)
    col = mix(joint, col, face)
    h = 0.22 + face * (0.36 + sh * 0.14 + (beds - 0.5) * 0.045 + (n - 0.5) * 0.04) - pits * 0.12 + (grain - 0.5) * 0.015
    k = curv(h, 2.0, 5.0)
    col *= (0.96 + 0.07 * k)[..., None] * (0.82 + 0.18 * ao(h, 3, 2.5))[..., None]
    return col, h

# ---------------------------------------------------------------- the Aztec (and the Egyptian's painted plaster)
def stucco(seed=471):
    # (burnished lime stucco under a thin paint — the Aztec's walls and platforms, the Egyptian's painted plaster: a smooth
    # skin polished by the trowel in broad sweeps, the paint brushed over it every way, a fine craquelure, and here and
    # there a piece fallen to the rough core of rubble and mortar, its edge a small lip; nothing that runs)
    r = rng(seed); x, y = grid(S)
    sweep = blur(strokes(S, _arc_items(r, 260, (0.05, 0.14), (0.6, 1.5), (0.3, 1.0), (6.0, 14.0)), 1.0), 2.0)
    items = []
    for k in range(2400):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); L = r.uniform(0.01, 0.04)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.2, 1.0), r.uniform(0.8, 1.8)))
    brush = blur(strokes(S, items, 1.0), 0.7)
    craq = _cracks(seed + 1, 22, 0.35, 0.35, 0.014)
    chips = []
    for k in range(6):
        cx, cy = r.random(), r.random(); n = 11; R = r.uniform(0.008, 0.022)
        chips.append(([(cx + np.cos(t) * R * r.uniform(0.6, 1.35), cy + np.sin(t) * R * r.uniform(0.6, 1.35)) for t in np.linspace(0, 2 * np.pi, n, endpoint=False)], 1))
    _, cc = stamp_polys(S, chips); cc = blur(cc, 0.7)
    lip = np.clip(blur(cc, 1.6) - cc, 0, 1) * 2
    core_n = fbm(S, 50, 3, seed + 2); core_s = smooth(0.55, 0.7, value_noise(S, 90, seed + 3))
    mott = fbm(S, 4, 4, seed + 4)
    col = hexc('#e6dccb') * (0.975 + (mott[..., None] - 0.5) * 0.05) * (0.99 + (sweep[..., None] - 0.5) * 0.02) * (0.985 + (brush[..., None] - 0.5) * 0.03)
    col = col * (1 - craq[..., None] * 0.16)
    core = mix(hexc('#a89c88'), hexc('#8e8272'), core_s) * (0.86 + core_n[..., None] * 0.26)
    col = mix(col, core, cc)
    col = col * (1 + lip[..., None] * 0.04)
    h = 0.62 + (mott - 0.5) * 0.03 + sweep * 0.012 + brush * 0.006 - craq * 0.05 - cc * (0.18 + (0.5 - core_n) * 0.08) + lip * 0.02
    k = curv(h, 2.0, 5.0)
    col *= (0.975 + 0.05 * k)[..., None] * (0.86 + 0.14 * ao(h, 3, 3.0))[..., None]
    return col, h

def tezontle(seed=481):
    # (the red stone of the valley's volcanoes — tezontle — and the black basalt beside it, rough-cut into blocks and set in
    # a wide pale mortar: each block full of the gas's bubbles, from pinholes to a finger's width; the faces split flat but
    # never smooth, each split its own slant; some blocks darker, a few the near-black of basalt; nothing with a direction)
    M = 2.4; r = rng(seed); x, y = grid(S)
    wx, wy = wfield(S, 4, seed, 0.03); wx2, wy2 = wfield(S, 18, seed + 1, 0.008)
    f1, f2, ids, ox, oy = voronoi(S, 6, seed + 2, 0.75, ny=10, stretch=(1.0, 1.6), dx=wx + wx2, dy=wy + wy2, jy=0.35)
    e = f2 - f1
    J = 0.05
    stone = smooth(J, J + 0.035, e)
    shoulder = smooth(J, J + 0.12, e) ** 0.5
    sx = (hash01(ids, seed + 3) - 0.5) * 0.12; sz = (hash01(ids, seed + 4) - 0.5) * 0.12
    slant = ox * sx + oy * sz
    ves = []
    for k in range(3000):
        rr_ = r.uniform(0.0012, 0.0045) * (1 + 1.6 * (r.random() > 0.93))
        ves.append((r.random(), r.random(), rr_, rr_ * r.uniform(0.6, 1.0), r.uniform(0, 3), 1))
    _, vc = stamp_ellipses(S, ves)
    dens = smooth(0.3, 0.7, fbm(S, 8, 3, seed + 5)) * (0.4 + hash01(ids, seed + 6) * 0.8)
    ves_m = np.clip(vc * np.clip(dens, 0, 1) * 1.4, 0, 1) * stone
    rough = fbm(S, 64, 3, seed + 7); grain = value_noise(S, 320, seed + 8)
    pores = (smooth(0.68, 0.8, value_noise(S, 140, seed + 13)) * smooth(0.35, 0.7, value_noise(S, 30, seed + 14)) * 0.7 + smooth(0.72, 0.86, value_noise(S, 300, seed + 15)) * 0.5) * stone
    kind = hash01(ids, seed + 9)
    red = ramp(hash01(ids, seed + 10), [(0, '#8e4636'), (0.35, '#9c5442'), (0.7, '#7c3c30'), (1, '#a65e48')])
    dark = ramp(hash01(ids, seed + 11), [(0, '#5e4038'), (1, '#6a4a40')])
    base = np.where((kind > 0.88)[..., None], dark, red)
    col = base * (0.88 + rough[..., None] * 0.2) * (0.97 + (grain[..., None] - 0.5) * 0.08) * (1 + slant[..., None] * 1.2)
    col = mix(col, col * 0.5, ves_m * 0.9)
    col = col * (1 - pores[..., None] * 0.22)
    mortar = hexc('#a08070') * (0.9 + fbm(S, 40, 2, seed + 12)[..., None] * 0.16)
    col = mix(mortar, col, stone)
    h = 0.2 + stone * (0.4 + shoulder * 0.05 + slant * 0.6 + (rough - 0.5) * 0.1) - ves_m * 0.16 - pores * 0.05 + (grain - 0.5) * 0.02
    k = curv(h, 2.0, 5.0)
    col *= (0.965 + 0.05 * k)[..., None] * (0.8 + 0.2 * ao(h, 3, 2.2))[..., None]
    return col, h

MATS = [
    # name, maker, metres the picture covers, what it is (arte/BIBLIA.md §7) — the people who use each in the notes
    ('ashlar', ashlar, 2.4, 'cantaria: blocos de pedra aparelhada em fiadas (calcário), margem lisa e miolo picado ou com gradim, juntas finas de cal, arestas lascadas — clássico, romano, grego, egípcio'),
    ('marble', marble, 2.4, 'mármore em blocos: branco de veios cinzentos, cada bloco da sua parte da pedreira, juntas finíssimas, pátina cor de mel — base e colunas gregas, fachadas e degraus romanos', {'hblur': 1.0}),
    ('tegula', tegula, 2.0, 'telhado romano: telhas planas de aba (tégulas) e capas redondas (ímbrices) a cada meio metro, cada telha de um tom, líquen nas capas, sujeira nos canais'),
    ('whitewash', whitewash, 3.0, 'caiação grega: demãos de cal sobre pedra solta, os calombos das pedras arredondados, pinceladas, lascas da demão de cima, trincas finas', {'hblur': 1.0}),
    ('painted', painted, 1.2, 'madeira pintada: tábuas de 13–17 cm sob demãos de tinta, pincel ao longo do veio, tinta gasta nas bordas e lascada até a demão de baixo e a madeira, craquelado — portas e janelas gregas, acabamentos'),
    ('adobe', adobe, 2.4, 'tijolo de barro (adobe) com palha, juntas grossas de barro, reboco de barro alisado à mão com rachas de secagem, gasto até os tijolos em partes — egípcio'),
    ('sandstone', sandstone, 3.0, 'arenito em blocos grandes, ombros arredondados pelo vento, camadas finas de areia em cada bloco, colmeia de buraquinhos, faixas de ferro — templos e bases egípcias'),
    ('stucco', stucco, 3.0, 'estuque brunido e pintado: pele lisa com varridas da colher, pincel por cima, craquelado fino, lascas até o miolo áspero — paredes e plataformas astecas, reboco pintado egípcio', {'hblur': 1.0}),
    ('tezontle', tezontle, 2.4, 'pedra vulcânica (tezontle vermelho e basalto) em blocos rachados, cheia de bolhas, argamassa larga e clara — muros, bases e plataformas astecas', {'hblur': 1.0, 'q': 82}),
]
