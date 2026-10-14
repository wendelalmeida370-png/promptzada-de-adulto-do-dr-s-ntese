# texturas: the materials of the body's 3D view, made by hand in code (no third-party pictures: original, no licence to
# keep). Each material is a colour picture and a height picture that repeat without seams; the game multiplies the
# colour the world gives a thing (the wood of a people's walls, the green of a meadow tile) by the picture's own
# variation around its mean — so the 3D keeps the god's colours and gains grain, joints, tufts and stones — and lights
# the height as relief. Run: python3 arte/texturas.py [pasta das prévias]  →  js/tex3d.js (and previews, if a folder is given)
import sys, os, io, base64, json
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from texlib import *

S = 512
OUT = {}

def put(name, col, h, metres, note):
    OUT[name] = (np.clip(col, 0, 1).astype(np.float32), np.clip(h, 0, 1).astype(np.float32), metres, note)

# (the height as it goes into the picture's alpha: never near 0 — the browser keeps a picture's colour multiplied by its
# alpha, so where the alpha is almost nothing the colour comes back black or in steps (the mortar, the gaps between the
# boards) —, and softened by less than a pixel: the game reads the slope three pixels apart, finer grain only shimmers)
H0 = 0.12
def alpha_of(h, sigma=0.75): return H0 + (1 - H0) * np.clip(blur(np.clip(h, 0, 1), sigma), 0, 1)

# (what a material may ask beside the four fields — a fifth, optional: px, the picture's side once saved (256 for a cloth
# whose threads no screen will show: the game draws every picture at 512 when it reads it); hblur, the softening of its
# height; q, the WebP quality)
OPTS = {'px': 512, 'hblur': 0.75, 'q': 86}
def opts_of(m): o = dict(OPTS); o.update(m[4] if len(m) > 4 else {}); return o
BUDGET = 6.0e6   # (bytes of base64 for the whole stack: arte/ESTUDIO.md)

# ---------------------------------------------------------------- walls and roofs
def planks(seed=11, vertical=True):
    r = rng(seed); x, y = grid(S)
    # boards of uneven width across, each its own length of plank (a joint here and there), a gap between them
    edges = [0.0]
    while edges[-1] < 1.0: edges.append(edges[-1] + r.uniform(0.09, 0.15))
    edges = np.array(edges) / edges[-1]; nb = len(edges) - 1
    b = np.searchsorted(edges, x, side='right') - 1; b = np.clip(b, 0, nb - 1)
    u = (x - edges[b]) / (edges[b + 1] - edges[b])  # across the board 0..1
    joint_at = r.random(nb); has_joint = r.random(nb) < 0.55
    dj = np.abs(((y - joint_at[b] + 0.5) % 1.0) - 0.5); joint = has_joint[b] & (dj < 0.004)
    seg = np.where(has_joint[b] & (((y - joint_at[b]) % 1.0) > 0.5), 1, 0); pid = b * 2 + seg
    # the grain: long fibres along the board, waving round the knots
    gn = fbm(S, 6, 4, seed + 1, 0.55, ny=1); fib = value_noise(S, 140, seed + 2, 3) * 0.6 + value_noise(S, 300, seed + 3, 6) * 0.4
    knots = []; kmap = np.zeros((S, S), np.float32)
    for k in range(9):
        kb = r.integers(0, nb); kx = (edges[kb] + edges[kb + 1]) / 2 + r.uniform(-0.02, 0.02); ky = r.random(); rr = r.uniform(0.008, 0.02)
        dx = ((x - kx + 0.5) % 1) - 0.5; dy = (((y - ky + 0.5) % 1) - 0.5) * 0.35
        d = np.sqrt(dx * dx + dy * dy); kmap = np.maximum(kmap, np.exp(-(d / rr) ** 2)); knots.append((kx, ky, rr))
    rings = np.sin((u * 3.0 + gn * 6.0 + kmap * 8.0 + hash01(pid, seed + 4) * 20) * np.pi * 2.2) * 0.5 + 0.5
    grain = 0.55 * rings + 0.45 * fib
    tone = hash01(pid, seed + 5); warmth = hash01(pid, seed + 6)
    base = mix(hexc('#a07850'), hexc('#7a5a3c'), tone)
    base = mix(base, base * np.array([0.92, 0.96, 1.05]), warmth * 0.6)  # (some boards greyer with the years)
    grey = smooth(0.55, 0.8, fbm(S, 3, 3, seed + 7)) * 0.5; base = mix(base, np.array([0.55, 0.52, 0.48]), grey * 0.6)
    col = base * (0.82 + grain[..., None] * 0.3)
    col = mix(col, col * np.array([0.55, 0.42, 0.32]), kmap * 0.85)
    # (nails at the ends of the boards, near the joints and the top)
    for k in range(nb):
        for yy in (joint_at[k], (joint_at[k] + 0.5) % 1):
            for side in (0.3, 0.7):
                nx = edges[k] + (edges[k + 1] - edges[k]) * side; d = np.sqrt((((x - nx + 0.5) % 1) - 0.5) ** 2 + (((y - yy - 0.012 + 0.5) % 1) - 0.5) ** 2)
                col = mix(col, np.array([0.18, 0.16, 0.15]), smooth(0.004, 0.0025, d))
    gap = smooth(0.0, 0.035, np.minimum(u, 1 - u)) * (1 - joint)
    h = 0.75 + 0.12 * np.sin(u * np.pi) + (grain - 0.5) * 0.08 - kmap * 0.05
    h = h * gap + 0.05 * (1 - gap)
    col = col * (0.32 + 0.68 * gap[..., None])
    k = curv(h, 2.0, 4.0)
    col *= (0.94 + 0.08 * k)[..., None]
    if not vertical: col = np.transpose(col, (1, 0, 2)); h = h.T
    return col, h

def beams(seed=21):
    # (a hewn timber, the grain up the picture: the shallow scallops the adze left, each a facet of its own shade with a
    # soft ridge where two meet, long drying checks along the grain, the wood darkened by tar and smoke)
    r = rng(seed); x, y = grid(S)
    fib = value_noise(S, 160, seed, 3) * 0.5 + value_noise(S, 60, seed + 1, 2) * 0.5; gn = fbm(S, 5, 4, seed + 2, ny=1)
    rings = np.sin((x * 9 + gn * 5) * np.pi * 2) * 0.5 + 0.5
    wx, wy = wfield(S, 5, seed + 3, 0.03)
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 4, 0.8, ny=20, stretch=(1.0, 2.4), dx=wx, dy=wy, jy=0.4)
    dish = -(f1 ** 2) * 0.05 + hash01(ids, seed + 5) * 0.02     # (each stroke of the adze a shallow scallop across the grain)
    ridge = smooth(0.1, 0.0, f2 - f1)
    # (the checks: a few long splits along the grain, tapering at both ends)
    checks = np.zeros((S, S), np.float32)
    for k in range(7):
        cx = r.random(); cy = r.random(); L = r.uniform(0.2, 0.55); w = r.uniform(0.0025, 0.005)
        dxp = ((x - cx + 0.5) % 1) - 0.5 + (fbm(S, 6, 2, seed + 10 + k, ny=2) - 0.5) * 0.02; dyp = ((y - cy + 0.5) % 1) - 0.5
        taper = np.clip(1 - (dyp / (L / 2)) ** 2, 0, 1)
        checks = np.maximum(checks, smooth(w * taper + 1e-4, 0.0, np.abs(dxp)) * (taper > 0))
    tone = hash01(ids, seed + 6)
    col = mix(hexc('#5c4029'), hexc('#43301f'), rings * 0.5 + fib * 0.5)
    col = col * (0.96 + ridge[..., None] * 0.04 + (tone[..., None] - 0.5) * 0.06)
    col = mix(col, hexc('#2a1c14'), checks[..., None] * 0.75)
    h = 0.62 + dish + (fib - 0.5) * 0.08 + ridge * 0.02 - checks * 0.35
    k = curv(h, 2.5, 5.0)
    col *= (0.93 + 0.12 * k)[..., None] * (0.8 + 0.2 * ao(h, 3, 3.0))[..., None]
    return col, h

def stonewall(seed=31):
    # (a wall of field stones laid in rough courses: rounded stones of many sizes, each its own rock — grey, brown,
    # bluish, a pale one —, set in lime mortar pushed back into the joints (lighter than the stones, never black), small
    # stones chinking the pockets between them, the crowns worn smooth, crusts of lichen; no direction to it)
    r = rng(seed); x, y = grid(S)
    wx, wy = wfield(S, 5, seed, 0.05); wx2, wy2 = wfield(S, 16, seed + 1, 0.012)
    f1, f2, ids, ox, oy = voronoi(S, 7, seed + 2, 0.85, ny=10, stretch=(1.0, 1.45), dx=wx + wx2, dy=wy + wy2, jy=0.3)
    e = f2 - f1; R = 0.5 + hash01(ids, seed + 3) * 0.22
    rim = smin(e * 0.9, (R - f1) * 0.8, 0.08)              # (inside the stone: the nearer of its edge and its round)
    stone = smooth(0.015, 0.06, rim)
    dome = smooth(0.0, 0.3, rim) ** 0.55
    # (the chinking stones in the mortar's pockets)
    g1, g2, idc, _, _ = voronoi(S, 19, seed + 4, 0.9, ny=26, dx=wx, dy=wy)
    c_rim = smin((g2 - g1) * 0.9, (0.45 - g1) * 0.8, 0.08); chink = smooth(0.02, 0.08, c_rim) * (1 - stone) * (hash01(idc, seed + 5) > 0.35)
    cdome = smooth(0.0, 0.2, c_rim) ** 0.6 * chink
    n1 = fbm(S, 14, 4, seed + 6); n2 = fbm(S, 60, 3, seed + 7); grain = value_noise(S, 260, seed + 8)
    kind = hash01(ids, seed + 9); tone = hash01(ids, seed + 10)
    base = ramp(kind, [(0, '#8e8a84'), (0.3, '#868078'), (0.5, '#98866c'), (0.68, '#787b7e'), (0.86, '#68645e'), (1, '#a8a49a')])
    base = base * (0.9 + tone[..., None] * 0.2)
    speck = blur(smooth(0.72, 0.8, grain), 0.5) * (kind < 0.35)        # (the granite's dark grains)
    sc = base * (0.86 + n1[..., None] * 0.26) * (1 - speck[..., None] * 0.14)
    ckind = hash01(idc, seed + 11)
    cc = ramp(ckind, [(0, '#7c7872'), (0.5, '#958d80'), (1, '#6c6e72')]) * (0.9 + n1[..., None] * 0.2)
    mortar = mix(hexc('#b0a896'), hexc('#9a9282'), n2) * (0.92 + (grain[..., None] - 0.5) * 0.2)
    moss = smooth(0.62, 0.74, fbm(S, 6, 4, seed + 12))
    mortar = mix(mortar, hexc('#6e7a48'), moss * 0.55)
    col = mix(mortar, cc, chink)
    col = mix(col, sc, stone)
    lich = smooth(0.66, 0.72, fbm(S, 9, 4, seed + 13)) * stone * smooth(0.3, 0.8, dome)
    col = mix(col, hexc('#b4b6a0'), lich * 0.5)
    col = mix(col, hexc('#c8a85a'), smooth(0.78, 0.82, fbm(S, 26, 3, seed + 14)) * stone * 0.45)   # (a yellow crust)
    h = 0.2 + stone * (0.25 + dome * 0.45 + (n1 - 0.5) * 0.12) + cdome * 0.3 + (n2 - 0.5) * 0.04 + (grain - 0.5) * 0.03
    k = curv(h, 3.0, 4.0)
    col *= (0.92 + 0.14 * k)[..., None] * (0.66 + 0.34 * ao(h, 4, 2.2))[..., None]
    return col, h

def brick(seed=41):
    r = rng(seed); x, y = grid(S); rows = 20; cols = 6   # (8 cm courses: a 7 cm brick and its joint; 27 cm long)
    ry = y * rows; row = np.floor(ry).astype(int); fy = ry - row
    rx = x * cols + (row % 2) * 0.5 + hash01(row % rows, seed) * 0.15; cl = np.floor(rx).astype(int); fx = rx - cl
    bid = (row % rows) * 64 + (cl % cols)
    n = fbm(S, 32, 4, seed + 1); ch = fbm(S, 48, 3, seed + 2)
    edge = np.minimum(np.minimum(fx, 1 - fx) * 2.6, np.minimum(fy, 1 - fy)) + (ch - 0.5) * 0.05
    b = smooth(0.06, 0.12, edge)
    tone = hash01(bid, seed + 3)
    base = ramp(tone, [(0, '#8a4a34'), (0.5, '#a85c3e'), (0.85, '#b87a56'), (1, '#6a3a2c')])
    col = mix(hexc('#a09888') * (0.8 + n[..., None] * 0.3), base * (0.85 + n[..., None] * 0.3), b)
    h = 0.15 + b * (0.65 + (n - 0.5) * 0.2)
    k = curv(h, 2.0, 4.0)
    col *= (0.93 + 0.1 * k)[..., None] * (0.8 + 0.2 * ao(h, 3, 2.0))[..., None]
    return col, h

def plaster(seed=51):
    # (lime plaster laid by hand: coat over coat of limewash, each a shade warmer or cooler with a soft lip where it ends,
    # sand in it, a pit here and there, hairline cracks that branch, a small chip knocked off — and no direction to any of
    # it: the game lays a wall's picture upside down, and a stain that ran up the wall would be worse than none)
    r = rng(seed); x, y = grid(S)
    big = fbm(S, 3, 4, seed); mid = fbm(S, 8, 4, seed + 1); fine = fbm(S, 60, 3, seed + 2); grain = value_noise(S, 300, seed + 3)
    # the coats: a warped noise cut in terraces — each step a coat of limewash, its own shade, its edge a soft lip
    wx, wy = wfield(S, 4, seed + 10, 0.18)
    w = warp(fbm(S, 5, 4, seed + 11), wx + 0.5, wy + 0.5, 1.0)
    q = w * 7; lv = np.floor(q); ft = q - lv; step = lv + smooth(0.78, 1.0, ft)
    ctone = hash01(lv.astype(int) - int(lv.min()), seed + 12)
    lip = smooth(0.7, 0.95, ft) * smooth(1.0, 0.97, ft)
    col = mix(hexc('#f2eadc'), hexc('#ddd0ba'), smooth(0.25, 0.8, big))
    col = col * (0.97 + (ctone[..., None] - 0.5) * 0.08) * (0.955 + mid[..., None] * 0.09) * (0.98 + (grain[..., None] - 0.5) * 0.06)
    sedge = lip
    col = mix(col, col * np.array([0.97, 0.965, 0.95]), smooth(0.55, 0.8, fbm(S, 5, 4, seed + 4)) * 0.6)   # (a cooler, older coat)
    col = mix(col, col * np.array([1.0, 0.975, 0.93]), smooth(0.6, 0.85, fbm(S, 4, 4, seed + 5)) * 0.5)   # (a warmer, dirtier one)
    # hairline cracks: edges of warped cells, only some of them, fading in and out
    wx, wy = wfield(S, 6, seed + 6, 0.05)
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 7, 0.95, dx=wx, dy=wy)
    crack = smooth(0.012, 0.0, f2 - f1) * (hash01(ids, seed + 8) > 0.55) * smooth(0.5, 0.65, fbm(S, 7, 3, seed + 9))
    col = col * (1 - crack[..., None] * 0.3)
    # pits and a few small chips (the coat gone, the rough render under it showing)
    pv, pc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.0012, 0.0025), r.uniform(0.0012, 0.0025), 0, 1) for _ in range(70)])
    chips = []
    for k in range(5):
        cx, cy = r.random(), r.random(); n = 9; R = r.uniform(0.008, 0.016)
        chips.append(([(cx + np.cos(t) * R * r.uniform(0.6, 1.3), cy + np.sin(t) * R * r.uniform(0.6, 1.3)) for t in np.linspace(0, 2 * np.pi, n, endpoint=False)], 1))
    cv, cc = stamp_polys(S, chips); cc = blur(cc, 0.6)
    col = mix(col, hexc('#c8b8a0') * (0.9 + fine[..., None] * 0.2), cc * 0.85)
    col = col * (1 - pc[..., None] * 0.12)
    h = 0.6 + (mid - 0.5) * 0.08 + step * 0.012 + sedge * 0.04 + (fine - 0.5) * 0.06 + (grain - 0.5) * 0.04 - crack * 0.18 - pc * 0.12 - cc * 0.16
    k = curv(h, 2.0, 6.0)
    col *= (0.97 + 0.05 * k)[..., None] * (0.86 + 0.14 * ao(h, 2, 3.0))[..., None]
    return col, h

def turf(seed=61):
    r = rng(seed); x, y = grid(S)
    soil = mix(hexc('#4a3a26'), hexc('#5e4a32'), fbm(S, 20, 3, seed))
    moss = smooth(0.55, 0.72, fbm(S, 9, 4, seed + 1)); dry = smooth(0.55, 0.75, fbm(S, 4, 4, seed + 2))
    # the blades: thousands of short strokes hanging down the slope (+y), each its own green
    items = []
    for k in range(9000):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.012, 0.035); a = np.pi / 2 + r.normal(0, 0.35)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.35, 1.0), r.uniform(0.6, 1.2)))
    bl = strokes(S, items, 2.0)
    cov = smooth(0.05, 0.5, blur(bl, 0.8))
    green = mix(hexc('#5e8a3a'), hexc('#7aa048'), bl)
    green = mix(green, hexc("#a8a058"), dry * 0.6 * bl)
    green = mix(green, hexc("#4e6c36"), moss * 0.38)
    under = mix(soil, hexc("#4a5e2e"), 0.5 + 0.3 * moss)   # (the short grass under the long, the earth only here and there)
    col = mix(under, green, np.maximum(cov, moss * 0.6))
    # (a few small flowers in the turf)
    fl, fc = stamp_ellipses(S, [(r.random(), r.random(), 0.004, 0.004, 0, r.integers(1, 3)) for _ in range(70)])
    col = mix(col, np.where((fl > 1.5)[..., None], hexc('#f0e6c8'), hexc('#e8c84a')), fc * 0.9)
    h = 0.3 + bl * 0.55 + moss * 0.15 + (fbm(S, 8, 3, seed + 4) - 0.5) * 0.2
    col *= (0.75 + 0.35 * light(h, 3))[..., None] * ao(h, 3, 1.5)[..., None]
    return col, h

def thatch(seed=71):
    # (straw laid in courses up the roof — the picture's top is the ridge: each course is thickest at its foot, where the
    # cut ends of the bundles show, and the step down from it to the course below lies in shadow; the courses wave a
    # little, the bundles each their own straw, some grey with age, moss where it stays damp)
    r = rng(seed); x, y = grid(S); rows = 7
    ry = y * rows + (value_noise(S, 5, seed, 1) - 0.5) * 0.35 + (value_noise(S, 23, seed + 1, 1) - 0.5) * 0.06
    row = np.floor(ry).astype(int); fy = ry - row          # (fy: 0 at the top of a course, 1 at its foot)
    items = []
    for k in range(9000):
        x0 = r.random(); yr = r.integers(0, rows); y0 = (yr + r.uniform(-0.1, 0.75)) / rows; L = r.uniform(0.06, 0.13); a = np.pi / 2 + r.normal(0, 0.07)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), r.uniform(0.5, 1.0)))
    st = strokes(S, items, 1.5)
    # (the cut ends at the foot of each course: short stubs, light where the sun bleached them)
    ends = []
    for k in range(5200):
        x0 = r.random(); yr = r.integers(0, rows); y0 = (yr + r.uniform(0.86, 0.99)) / rows
        ends.append((x0, y0, x0 + r.normal(0, 0.002), y0 + r.uniform(0.004, 0.012), r.uniform(0.4, 1.0), r.uniform(0.7, 1.2)))
    en = strokes(S, ends, 1.8)
    foot = smooth(0.8, 0.93, fy)
    bundle = value_noise(S, 26, seed + 2, rows * 2)        # (bundle by bundle along the course)
    base = mix(hexc('#a8884e'), hexc('#c8a862'), st * 0.7 + bundle * 0.3)
    weath = smooth(0.5, 0.8, fbm(S, 5, 4, seed + 3)); base = mix(base, hexc('#8c8472'), weath * 0.5)
    base = mix(base, mix(hexc('#cdb272'), hexc('#b09056'), en), foot * 0.8)
    shade = 0.6 + 0.4 * smooth(0.0, 0.25, fy)               # (under the foot of the course above)
    col = base * shade[..., None] * (0.9 + st[..., None] * 0.18)
    moss = smooth(0.6, 0.75, fbm(S, 6, 4, seed + 4)) * (1 - foot)
    col = mix(col, hexc('#74784c'), moss * 0.32)
    h = 0.22 + fy * 0.5 + st * 0.12 + foot * en * 0.12 + (bundle - 0.5) * 0.06
    k = curv(h, 2.0, 5.0)
    col *= (0.95 + 0.08 * k)[..., None] * (0.82 + 0.18 * ao(h, 3, 2.0))[..., None]
    return col, h

def tiles(seed=81):
    # (clay barrel tiles in columns down the roof — the picture's top is the ridge: a row of caps, round side up, over the
    # joints of a row of pans, round side down; each tile laps over the one below it, a thin shadow under its lip; no two
    # alike, a darker one put back after a storm, lichen on the caps, dirt and moss down the pans)
    r = rng(seed); x, y = grid(S); pairs = 6; rows = 6
    wv = (value_noise(S, 4, seed, 1) - 0.5) * 0.05
    px = x * pairs + wv; col_i = np.floor(px).astype(int); fx = px - col_i
    cap = fx < 0.5; u = np.where(cap, fx / 0.5, (fx - 0.5) / 0.5)        # (0..1 across a cap or a pan)
    ry = y * rows + (hash01(np.asarray(col_i * 2 + (~cap)) % (pairs * 2), seed + 1) - 0.5) * 0.3   # (each column its own courses)
    row = np.floor(ry).astype(int); fy = ry - row             # (0 under the lap of the tile above, 1 at this tile's lip)
    tid = (row % rows) * 32 + (col_i % pairs) * 2 + (~cap)
    # (a cap is round, a little narrower than its pan; a pan is a shallow channel)
    prof = np.where(cap, np.sin(np.pi * np.clip((u - 0.06) / 0.88, 0, 1)) ** 0.6, 1 - np.sin(np.pi * u) * 0.65)
    lip = smooth(0.82, 0.98, fy)
    hcap = 0.42 + 0.48 * prof + fy * 0.05; hpan = 0.18 + 0.2 * prof + fy * 0.05
    h = np.where(cap, hcap, hpan) + lip * 0.03
    n = fbm(S, 24, 4, seed + 2); tone = hash01(tid, seed + 3)
    base = ramp(tone, [(0, '#9a4a32'), (0.45, '#b4583a'), (0.8, '#c26c46'), (0.93, '#8e5a40'), (1, '#6e3e2c')])
    col = base * (0.9 + n[..., None] * 0.2)
    col = col * np.where(cap, 0.92 + 0.12 * prof, 0.82 + 0.1 * (1 - prof))[..., None]
    col = col * (0.62 + 0.38 * smooth(0.0, 0.14, fy))[..., None]          # (the shadow under the lap)
    col = mix(col, col * 1.08, lip[..., None] * 0.5)
    dirt = smooth(0.4, 0.8, fbm(S, 9, 3, seed + 4)) * (~cap) * (0.5 + 0.5 * fy)
    col = mix(col, hexc('#5e4a36'), dirt * 0.35)
    moss = smooth(0.62, 0.76, fbm(S, 8, 4, seed + 5)) * (~cap) * smooth(0.3, 0.9, fy)
    col = mix(col, hexc('#6e7a42'), moss * 0.5)
    lich = smooth(0.66, 0.76, fbm(S, 18, 3, seed + 6)) * smooth(0.55, 0.75, value_noise(S, 200, seed + 7)) * cap * smooth(0.2, 0.7, prof)
    col = mix(col, hexc('#d0c8a0'), lich * 0.4)
    k = curv(h, 2.0, 5.0)
    col *= (0.95 + 0.08 * k)[..., None] * (0.8 + 0.2 * ao(h, 3, 2.0))[..., None]
    return col, h

def shingles(seed=91):
    # (split wooden shingles in courses — the picture's top is the ridge: each thickest at its butt, the shadow of the
    # course above across its top; of uneven width, staggered, the grain up the roof, split lines, the butts a little
    # rounded and ragged, some silvered by the weather, a crust of lichen)
    r = rng(seed); x, y = grid(S); rows = 10
    ry = y * rows + (value_noise(S, 6, seed, 1) - 0.5) * 0.12; row = np.floor(ry).astype(int); fy = ry - row
    # (the widths of each course: 8 to 18 cm, drawn at random, the joints never over the ones below)
    X = np.zeros((S, S), np.float32); sid = np.zeros((S, S), np.int64); fx = np.zeros((S, S), np.float32); wd = np.zeros((S, S), np.float32)
    for k in range(rows):
        edges = [0.0]
        while edges[-1] < 1.0: edges.append(edges[-1] + r.uniform(0.04, 0.09))
        e = np.array(edges) / edges[-1]; off = r.random()
        m = (row % rows) == k; xx = (x[m] + off) % 1.0; b = np.clip(np.searchsorted(e, xx, side='right') - 1, 0, len(e) - 2)
        fx[m] = (xx - e[b]) / (e[b + 1] - e[b]); sid[m] = k * 64 + b; wd[m] = (e[b + 1] - e[b]) * 2.0
    gap = smooth(0.0, 0.05, np.minimum(fx, 1 - fx) * wd / 0.12)
    # (the butt: rounded at the corners, a little ragged)
    corner = np.hypot(np.maximum(0, 0.12 - np.minimum(fx, 1 - fx) * wd / 0.12 * 0.12) / 0.12, np.maximum(0, fy - 0.85) / 0.15)
    rag = (value_noise(S, 90, seed + 1, 4) - 0.5) * 0.04
    butt = smooth(1.0, 0.94, fy + rag) * smooth(1.0, 0.8, corner)
    fib = value_noise(S, 160, seed + 2, 6) * 0.6 + value_noise(S, 60, seed + 3, 3) * 0.4
    split = smooth(0.03, 0.0, np.abs(fbm(S, 30, 2, seed + 4, ny=2) - 0.5)) * (hash01(sid, seed + 5) > 0.6)
    tone = hash01(sid, seed + 6)
    base = mix(hexc('#6e5038'), hexc('#8a6a4a'), tone)
    silver = smooth(0.55, 0.85, hash01(sid, seed + 7) * 0.6 + fbm(S, 5, 3, seed + 8) * 0.6)
    base = mix(base, hexc('#8a8478'), silver * 0.55)
    col = base * (0.84 + fib[..., None] * 0.26) * (1 - split[..., None] * 0.3)
    col = col * (0.6 + 0.4 * smooth(0.0, 0.18, fy))[..., None]           # (the shadow of the course above)
    col = mix(col * 0.45, col, (gap * butt)[..., None])
    lich = smooth(0.66, 0.76, fbm(S, 16, 3, seed + 9)) * smooth(0.55, 0.75, value_noise(S, 200, seed + 10)) * gap * butt
    col = mix(col, hexc('#b8b8a0'), lich * 0.3)
    h = (0.25 + fy * 0.45 + (fib - 0.5) * 0.06 - split * 0.05) * (0.35 + 0.65 * gap * butt)
    k = curv(h, 2.0, 5.0)
    col *= (0.95 + 0.08 * k)[..., None] * (0.82 + 0.18 * ao(h, 3, 2.0))[..., None]
    return col, h

def slabs(seed=101):
    # (flagstones: big slabs with ragged, worn edges, each its own stone, the joints filled with earth and a little grass)
    r = rng(seed); wx, wy = wfield(S, 6, seed + 6, 0.05); wx2, wy2 = wfield(S, 20, seed + 7, 0.01)
    f1, f2, ids, _, _ = voronoi(S, 5, seed, 0.75, ny=5, dx=wx + wx2, dy=wy + wy2)
    e = f2 - f1; s_ = smooth(0.02, 0.06, e); n = fbm(S, 20, 4, seed + 1); n2 = fbm(S, 80, 2, seed + 2)
    wear = smooth(0.02, 0.2, e) ** 0.5                       # (the edges worn round by feet)
    tone = hash01(ids, seed + 3)
    base = mix(hexc('#a09a8e'), hexc('#7e7a72'), tone); base = mix(base, hexc('#a08a72'), smooth(0.7, 0.95, hash01(ids, seed + 4)) * 0.6)
    joint = mix(hexc('#6a5e4a'), hexc('#5e7a3e'), smooth(0.4, 0.7, fbm(S, 10, 3, seed + 5)))  # (grass in some joints)
    col = mix(joint, base * (0.86 + n[..., None] * 0.24 + (n2[..., None] - 0.5) * 0.1), s_)
    h = 0.15 + s_ * (0.35 + wear * 0.3 + (n - 0.5) * 0.12) + (n2 - 0.5) * 0.03
    k = curv(h, 2.5, 4.0)
    col *= (0.93 + 0.1 * k)[..., None] * (0.75 + 0.25 * ao(h, 3, 2.0))[..., None]
    return col, h

def cobble(seed=111):
    # (rounded setts laid close, worn smooth on top, earth and moss between them, each its own stone)
    wx, wy = wfield(S, 7, seed + 4, 0.04)
    f1, f2, ids, ox, oy = voronoi(S, 13, seed, 0.9, dx=wx, dy=wy)
    e = f2 - f1; R = 0.8 + hash01(ids, seed + 5) * 0.2
    rim = smin(e, (R - f1) * 0.9, 0.1); dome = smooth(0.0, 0.4, rim) ** 0.55; s_ = smooth(0.02, 0.07, rim)
    n = fbm(S, 40, 3, seed + 1); tone = hash01(ids, seed + 2)
    base = ramp(tone, [(0, '#7a766e'), (0.4, '#948e84'), (0.75, '#8a8072'), (1, '#6a6660')])
    gras = smooth(0.45, 0.65, fbm(S, 8, 4, seed + 3))
    joint = mix(hexc('#6a5c48'), hexc('#5a7238'), gras)
    col = mix(joint, base * (0.82 + n[..., None] * 0.28), s_)
    col = mix(col, col * 1.1, smooth(0.6, 1.0, dome)[..., None] * 0.5)   # (the tops polished by feet and wheels)
    h = 0.15 + dome * 0.7 + (n - 0.5) * 0.04 * s_
    k = curv(h, 2.5, 4.0)
    col *= (0.92 + 0.12 * k)[..., None] * (0.7 + 0.3 * ao(h, 3, 2.0))[..., None]
    return col, h

def bark(seed=121):
    # (the ridges of an old trunk: plates up the stem that part and meet again — the diamonds of an oak, an ash —
    # broken across now and then, their crowns weathered grey, the furrows between them deep but never black, moss in
    # them on one side; it must sit on any bark colour the world gives, from the pine's to the willow's)
    x, y = grid(S)
    wx, wy = wfield(S, 3, seed, 0.08, ny=2); wx2, _ = wfield(S, 10, seed + 1, 0.025, ny=5)
    f1, f2, ids, ox, oy = voronoi(S, 12, seed + 2, 0.95, ny=4, stretch=(1.0, 0.34), dx=wx + wx2, dy=wy * 0.3)
    e = f2 - f1
    ridge = smooth(0.0, 0.34, e) ** 0.6           # (0 in the furrow, 1 on the crown of the plate)
    # (some plates broken across by a jagged crack)
    jag = (fbm(S, 40, 2, seed + 3) - 0.5) * 0.05
    cy = (y + jag + ox * 0.02) * 7 + hash01(ids, seed + 4) * 7; brk = smooth(0.035, 0.0, np.abs((cy % 1.0) - 0.5) - 0.465) * (hash01(ids, seed + 5) > 0.6)
    fib = value_noise(S, 110, seed + 6, 8) * 0.55 + value_noise(S, 46, seed + 7, 4) * 0.45   # (fibres up the stem)
    n = fbm(S, 10, 4, seed + 8); fine = fbm(S, 80, 2, seed + 9)
    h = 0.16 + ridge * 0.6 + (fib - 0.5) * 0.08 * ridge + (n - 0.5) * 0.14 - brk * 0.3 * ridge + (fine - 0.5) * 0.05
    tone = hash01(ids, seed + 10) * smooth(0.0, 0.6, ridge)   # (each plate its own tone — on its crown, so no seam at its edge)
    col = mix(hexc('#685240'), hexc('#5a4836') * 1.12, tone) * (0.92 + (fib[..., None] - 0.5) * 0.16)
    # (the crowns greyed by the weather, the furrows darker and warmer)
    col = mix(col, hexc('#8c8476'), smooth(0.55, 1.0, ridge * (0.55 + n * 0.7)) * 0.4)
    col = mix(hexc('#40302a') * 1.0, col, 0.55 + 0.45 * smooth(0.0, 0.55, ridge))
    col = mix(col, col * 0.72, (brk * ridge)[..., None] * 0.8)
    # (a little moss deep in the furrows of one patch; a crust of pale lichen on a few crowns)
    moss = smooth(0.6, 0.74, fbm(S, 4, 4, seed + 11)) * (1 - smooth(0.2, 0.7, ridge))
    col = mix(col, hexc('#5a6634'), moss * 0.55)
    lich = smooth(0.68, 0.74, fbm(S, 12, 3, seed + 12)) * smooth(0.6, 0.9, ridge)
    col = mix(col, hexc('#9c9c86'), lich * 0.4)
    k = curv(h, 2.5, 5.0)
    col *= (0.94 + 0.1 * k)[..., None] * (0.74 + 0.26 * ao(h, 3, 2.5))[..., None]
    return col, h

# ---------------------------------------------------------------- the ground (a 4 m tile of the world)
def grass(seed=131):
    r = rng(seed); x, y = grid(S)
    soil = mix(hexc('#5a4a30'), hexc('#6a5a3a'), fbm(S, 24, 3, seed))
    items = []
    for k in range(16000):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.006, 0.02); a = r.uniform(0, 2 * np.pi)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), r.uniform(0.6, 1.2)))
    bl = strokes(S, items, 1.6)
    cov = smooth(0.0, 0.35, blur(bl, 1.2))
    patch = fbm(S, 5, 4, seed + 1); clump = fbm(S, 18, 3, seed + 2)
    green = mix(hexc('#5a8236'), hexc('#78a046'), bl); green = mix(green, hexc('#4a6e30'), smooth(0.55, 0.75, clump) * 0.6)
    green = mix(green, hexc('#9a9a50'), smooth(0.6, 0.8, patch) * 0.45)
    # (clover leaves and a few small flowers)
    cl, cc = stamp_ellipses(S, [(r.random(), r.random(), 0.006, 0.004, r.uniform(0, 3), 1) for _ in range(500)])
    green = mix(green, hexc('#5e9a3e'), cc * smooth(0.55, 0.7, fbm(S, 9, 3, seed + 3)))
    col = mix(soil, green, np.clip(cov + 0.35, 0, 1))
    fl, fc = stamp_ellipses(S, [(r.random(), r.random(), 0.0035, 0.0035, 0, r.integers(1, 4)) for _ in range(90)])
    col = mix(col, ramp(fl / 3.0, [(0, '#f4f0e0'), (0.5, '#e8d04a'), (1, '#c8a0e0')]), fc * 0.85)
    h = 0.35 + bl * 0.4 + clump * 0.2
    col *= (0.82 + 0.25 * light(h, 3))[..., None] * ao(h, 3, 1.2)[..., None]
    return col, h

def dirt(seed=141):
    # (trodden earth: small stones of many sizes half sunk in it — each its own grey or brown, a shadow round its foot —,
    # grit, the cracks of a dry spell, darker damp patches)
    r = rng(seed); x, y = grid(S)
    n = fbm(S, 10, 5, seed); n2 = fbm(S, 60, 3, seed + 1); grit = value_noise(S, 256, seed + 5)
    col = mix(hexc('#8a7050'), hexc('#6e5638'), n) * (0.9 + n2[..., None] * 0.2) * (0.95 + (grit[..., None] - 0.5) * 0.12)
    damp = smooth(0.55, 0.75, fbm(S, 4, 4, seed + 2)); col = col * (1 - damp[..., None] * 0.16)
    stones = []
    for k in range(700):
        cx, cy = r.random(), r.random(); R = r.uniform(0.002, 0.007) * (1 + 1.6 * (r.random() < 0.06)); m = 9
        stones.append(([(cx + np.cos(t) * R * r.uniform(0.7, 1.2), cy + np.sin(t) * R * r.uniform(0.6, 1.0)) for t in np.linspace(0, 2 * np.pi, m, endpoint=False)], r.uniform(0.05, 1.0)))
    pv, pc = stamp_polys(S, stones)
    dome = np.clip(blur(pc, 1.6) * 1.6 - 0.6, 0, 1) * pc; sh = np.clip(blur(pc, 2.5) - pc, 0, 1)
    scol = mix(ramp(pv, [(0, '#7e766a'), (0.4, '#8f877a'), (0.7, '#8a7a66'), (1, '#9a9284')]), col, 0.35)
    col = mix(col * (1 - sh[..., None] * 0.35), scol * (0.8 + dome[..., None] * 0.25), pc * 0.9)
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 3, dx=wfield(S, 8, seed + 6, 0.04)[0]); crack = smooth(0.01, 0.0, f2 - f1) * smooth(0.5, 0.7, fbm(S, 6, 3, seed + 4))
    col = col * (1 - crack[..., None] * 0.3)
    h = 0.35 + (n - 0.5) * 0.22 + dome * 0.35 - sh * 0.05 - crack * 0.15 + (n2 - 0.5) * 0.05 + (grit - 0.5) * 0.03
    k = curv(h, 2.0, 4.0)
    col *= (0.93 + 0.1 * k)[..., None] * (0.78 + 0.22 * ao(h, 2, 2.0))[..., None]
    return col, h

def sand(seed=151):
    x, y = grid(S)
    n = fbm(S, 8, 4, seed); g = value_noise(S, 256, seed + 1) * 0.5 + value_noise(S, 160, seed + 2) * 0.5
    wv = fbm(S, 4, 3, seed + 3)
    rip = np.sin((y * 20 + wv * 4 + x * 3) * np.pi * 2) * 0.5 + 0.5
    col = mix(hexc('#e2d0a4'), hexc('#cdb884'), n) * (0.92 + g[..., None] * 0.16)
    col = col * (0.95 + rip[..., None] * 0.08)
    dots = (g > 0.82) * 1.0; col = mix(col, hexc('#a89470'), dots * 0.35)
    h = 0.5 + rip * 0.15 + (g - 0.5) * 0.1 + (n - 0.5) * 0.2
    col *= (0.88 + 0.15 * light(h, 3))[..., None]
    return col, h

def rock(seed=161):
    # (a face of rock as a cliff shows it: layers of uneven thickness, split into blocks by joints that do not line up
    # from one layer to the next — most only a hairline, a few gaping —, each block broken into facets painted each its
    # own shade, as a painter does a cliff (the light of the game only lifts the small relief: the big planes are in the
    # colour), the chipped edges catching the light, grit, lichen; dark joints but never black, and no line quite straight)
    r = rng(seed); x, y = grid(S)
    wx, wy = wfield(S, 3, seed, 0.07); wx2, wy2 = wfield(S, 11, seed + 1, 0.018)
    X = x + wx + wx2; Y = (y + wy + wy2) % 1.0
    # the layers: their thickness drawn at random, their lines wavy
    NL = 7; th = r.uniform(0.5, 1.6, NL); cum = np.concatenate([[0], np.cumsum(th) / th.sum()])
    L = np.clip(np.searchsorted(cum, Y, side='right') - 1, 0, NL - 1); ft = (Y - cum[L]) / (cum[L + 1] - cum[L])
    tm = th[L] / th.sum() * 4.5
    # the blocks of each layer: 2 to 5 across, offset, the joints leaning and bent
    nb = r.integers(2, 6, NL); off = r.random(NL); lean = r.uniform(-0.5, 0.5, NL)
    bx = X * nb[L] + off[L] + lean[L] * (ft - 0.5) * tm / 4.5 * nb[L] + (fbm(S, 8, 3, seed + 2) - 0.5) * 0.25
    bi = np.floor(bx).astype(int); fb = bx - bi; bid = L * 16 + (bi % nb[L]); wm = 4.5 / nb[L]
    ex = np.minimum(fb, 1 - fb) * wm; ey = np.minimum(ft, 1 - ft) * tm
    gape = hash01(bid, seed + 3); vary = fbm(S, 24, 3, seed + 4)
    jw = 0.012 + 0.05 * smooth(0.55, 0.95, gape * 0.6 + vary * 0.5)   # (metres: a hairline here, a gap there)
    shut = smooth(0.4, 0.7, fbm(S, 5, 3, seed + 18, ny=2))   # (stretches where the bed joint closes to a hairline)
    jb = np.maximum(0.007, jw * (1 - shut * 0.85))
    rq = (fbm(S, 40, 2, seed + 5) - 0.5) * 0.015
    q = np.minimum((ex * (0.8 + vary * 0.4) + rq) / jw, (ey + rq) / jb)
    joint = smooth(0.0, 1.0, q); e = q * jw
    chip = smooth(0.0, 1.0, (e - jw * 0.6) / 0.12)
    # the facets: cells inside the blocks, each its own shade and a small step from its neighbour
    g1, g2, idf, _, _ = voronoi(S, 9, seed + 6, 0.95, ny=7, dx=wx * 1.6, dy=wy * 1.6)
    fe = smooth(0.0, 0.06, g2 - g1)
    ftone = hash01(idf * 7 + bid % 7, seed + 7)
    hard = hash01(L, seed + 8); n = fbm(S, 18, 5, seed + 9)
    grit = value_noise(S, 220, seed + 10) * 0.5 + value_noise(S, 110, seed + 11) * 0.5
    # (a few fine cracks across a block: the edges of a sparse set of cells)
    c1, c2, cid, _, _ = voronoi(S, 6, seed + 12, 0.9, dx=wx2 * 3, dy=wy2 * 3)
    crk = smooth(0.012, 0.0, c2 - c1) * (hash01(cid, seed + 13) > 0.65) * chip
    h = 0.32 + 0.38 * chip + (ftone - 0.5) * 0.08 * fe + (hard - 0.5) * 0.08 + (n - 0.5) * 0.12 + (grit - 0.5) * 0.05 - crk * 0.12
    h = h * (0.3 + 0.7 * joint)
    tone = hash01(bid, seed + 14)
    col = ramp(tone * 0.5 + hard * 0.5, [(0, '#77736b'), (0.35, '#8a847a'), (0.7, '#979083'), (1, '#7f786d')])
    col = col * (0.86 + 0.24 * ftone[..., None] * (0.4 + 0.6 * fe[..., None]))   # (the facets, each its shade)
    col = mix(col, col * np.array([1.08, 1.0, 0.87]), smooth(0.55, 0.85, fbm(S, 5, 3, seed + 15)) * 0.5)   # (iron in the stone)
    col = col * (0.9 + n[..., None] * 0.2) * (0.95 + (grit[..., None] - 0.5) * 0.14)
    col = mix(col * 0.5, col, (0.18 + 0.82 * joint)[..., None]) * (1 - crk[..., None] * 0.3)
    col = mix(col, col * 1.12, smooth(0.0, 0.5, chip * (1 - chip) * 4)[..., None] * 0.5)   # (the chipped lip of a block, lighter)
    lich = smooth(0.6, 0.68, fbm(S, 7, 4, seed + 16)) * chip
    col = mix(col, hexc('#a8aa7c'), lich * 0.4)
    col = mix(col, hexc('#c6a868'), smooth(0.76, 0.8, fbm(S, 20, 3, seed + 17)) * chip * 0.38)   # (a yellow crust here and there)
    k = curv(h, 3.0, 4.0)
    col *= (0.92 + 0.14 * k)[..., None] * (0.72 + 0.28 * ao(h, 5, 2.0))[..., None]
    return col, h

def gravel(seed=171):
    # (loose gravel: rounded pebbles of a few sizes and greys, with the grit and the shadow between them)
    wx, wy = wfield(S, 10, seed + 3, 0.02)
    f1, f2, ids, ox, oy = voronoi(S, 30, seed, 0.95, dx=wx, dy=wy)
    e = f2 - f1; R = 0.45 + hash01(ids, seed + 2) * 0.3
    rim = smin(e, (R - f1) * 0.9, 0.1); dome = smooth(0.0, 0.35, rim) ** 0.6; s_ = smooth(0.0, 0.07, rim)
    tone = hash01(ids, seed + 1); n = fbm(S, 40, 2, seed + 6)
    base = ramp(tone, [(0, '#7a746a'), (0.5, '#a49c8e'), (0.8, '#8e8678'), (1, '#b2aa9a')])
    grit = mix(hexc('#6e6456'), hexc('#857a6a'), value_noise(S, 256, seed + 7))
    col = mix(grit, base * (0.88 + n[..., None] * 0.2), s_)
    h = 0.15 + dome * 0.62
    k = curv(h, 1.5, 4.0)
    col *= (0.92 + 0.12 * k)[..., None] * (0.7 + 0.3 * ao(h, 2, 2.5))[..., None]
    return col, h

def snow(seed=181):
    x, y = grid(S)
    n = fbm(S, 5, 5, seed); g = value_noise(S, 220, seed + 1)
    col = mix(hexc('#f4f8fc'), hexc('#d6e2f0'), smooth(0.35, 0.75, n))
    spark = (g > 0.93) * (fbm(S, 40, 2, seed + 2) > 0.5); col = col + spark[..., None] * 0.12
    h = 0.4 + n * 0.4 + (g - 0.5) * 0.03
    col *= (0.9 + 0.12 * light(h, 3))[..., None]
    return col, h

def forest(seed=191):
    # (the floor of a wood: fallen leaves — pointed, each with its midrib, brown, ochre, rust, a few still green —, pine
    # needles, twigs, moss in soft cushions, the dark earth between)
    r = rng(seed); x, y = grid(S)
    col = mix(hexc('#4a3a28'), hexc('#5e4a32'), fbm(S, 16, 4, seed))
    leaves = []; ribs = []
    for k in range(6500):
        cx, cy = r.random(), r.random(); L = r.uniform(0.008, 0.017); W = L * r.uniform(0.32, 0.5); a = r.uniform(0, 2 * np.pi); v = r.random()
        ca, sa = np.cos(a), np.sin(a); pts = []
        for t in np.linspace(0, 2 * np.pi, 14, endpoint=False):
            px = np.cos(t) * L; py = np.sin(t) * W * np.abs(np.cos(t * 0.5)) ** 0.3   # (pointed at both ends)
            pts.append((cx + px * ca - py * sa, cy + px * sa + py * ca))
        leaves.append((pts, v)); ribs.append((cx - ca * L * 0.9, cy - sa * L * 0.9, cx + ca * L * 0.9, cy + sa * L * 0.9, 1.0, 0.6))
    lv, lc = stamp_polys(S, leaves)
    rb = strokes(S, ribs, 0.8)
    leaf = ramp(lv, [(0, '#6a4a2a'), (0.3, '#8a5e30'), (0.55, '#a07a3a'), (0.72, '#7a4428'), (0.86, '#6a7034'), (1, '#8a6034')])
    leaf = leaf * (1 - rb[..., None] * 0.18 * lc[..., None])
    col = mix(col, leaf * (0.85 + fbm(S, 60, 2, seed + 2)[..., None] * 0.25), lc)
    nd = []
    for k in range(1600):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); L = r.uniform(0.006, 0.012)
        nd.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.5, 1.0), 0.5))
    ne = strokes(S, nd, 1.0)
    col = mix(col, hexc('#8a6a3a'), np.clip(ne, 0, 1)[..., None] * 0.7)
    tw = []
    for k in range(40):
        x0, y0 = r.random(), r.random(); a = r.uniform(0, np.pi); pts = [(x0, y0)]
        for q in range(4): a += r.normal(0, 0.4); L = r.uniform(0.01, 0.025); pts.append((pts[-1][0] + np.cos(a) * L, pts[-1][1] + np.sin(a) * L))
        tw += polyline_items(pts, 1.0, r.uniform(1.2, 2.2))
    twg = strokes(S, tw, 1.0)
    col = mix(col, hexc('#5a4430'), np.clip(twg, 0, 1)[..., None] * 0.9)
    moss = smooth(0.62, 0.74, fbm(S, 9, 4, seed + 1)); mt = fbm(S, 50, 3, seed + 3)
    col = mix(col, mix(hexc('#4e6a2e'), hexc('#6a8a3a'), mt), moss * 0.65)
    h = 0.25 + lc * 0.25 + blur(lc, 1.0) * 0.1 + twg * 0.2 + ne * 0.08 + moss * (0.15 + mt * 0.1) + fbm(S, 30, 3, seed + 4) * 0.12
    k = curv(h, 1.5, 4.0)
    col *= (0.92 + 0.12 * k)[..., None] * (0.75 + 0.25 * ao(h, 2, 2.0))[..., None]
    return col, h

def soil(seed=201):
    r = rng(seed)
    n = fbm(S, 14, 5, seed); n2 = fbm(S, 70, 3, seed + 1)
    col = mix(hexc('#6a4e34'), hexc('#54402a'), n) * (0.88 + n2[..., None] * 0.24)
    cv, cc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.006, 0.016), r.uniform(0.005, 0.012), r.uniform(0, 3), r.uniform(0.6, 1.0)) for _ in range(500)])
    col = mix(col, col * 1.15, cc * 0.6)
    h = 0.4 + (n - 0.5) * 0.3 + blur(cc, 1.0) * 0.3
    col *= (0.8 + 0.3 * light(h, 4))[..., None] * ao(h, 2, 1.5)[..., None]
    return col, h

MATS = [
    # name, maker, metres the picture covers, what it is
    ('planks', lambda: planks(), 2.0, 'tábuas de madeira em pé, com veio, nós, pregos e frestas'),
    ('planksH', lambda: planks(12, False), 2.0, 'tábuas deitadas'),
    ('beam', beams, 1.6, 'viga escura com rachaduras'),
    ('stone', stonewall, 2.4, 'parede de pedra de campo com argamassa e líquen'),
    ('brick', brick, 1.6, 'tijolo em amarração, cada um de um tom'),
    ('plaster', plaster, 3.0, 'reboco de cal manchado, com trincas finas'),
    ('turf', turf, 2.0, 'telhado de turfa: touceiras, musgo, partes secas, florzinhas', {'hblur': 1.1}),
    ('thatch', thatch, 2.0, 'palha em fiadas'),
    ('tile', tiles, 2.0, 'telha de barro curva, cada uma de um tom, musgo'),
    ('shingle', shingles, 2.0, 'telhas de madeira'),
    ('slab', slabs, 3.0, 'lajes de pedra com grama nas juntas'),
    ('cobble', cobble, 2.6, 'calçamento de paralelepípedo com terra e grama entre as pedras'),
    ('bark', bark, 1.4, 'casca de árvore em placas, com musgo'),
    ('grass', grass, 4.0, 'chão de capim: folhas, trevo, florzinhas, terra aparecendo', {'hblur': 1.1}),
    ('dirt', dirt, 4.0, 'terra batida com seixos e rachaduras'),
    ('sand', sand, 4.0, 'areia com ondulações'),
    ('rock', rock, 4.5, 'rocha em camadas partidas em blocos, juntas desencontradas, facetas, líquen'),
    ('gravel', gravel, 3.0, 'cascalho'),
    ('snow', snow, 5.0, 'neve com sombra azul'),
    ('forest', forest, 4.0, 'chão de mata: folhas secas com nervura, agulhas, gravetos, almofadas de musgo', {'hblur': 1.0}),
    ('soil', soil, 4.0, 'terra lavrada'),
]

def all_mats():
    # (the materials of each area live in their own arte/mat_<area>.py, a list MATS in the same form: joined here)
    import glob, importlib.util
    out = list(MATS); seen = {m[0] for m in out}
    for f in sorted(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'mat_*.py'))):
        spec = importlib.util.spec_from_file_location(os.path.basename(f)[:-3], f); mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
        for m in getattr(mod, 'MATS', []):
            if m[0] in seen: raise SystemExit(f'material repetido: {m[0]} ({f})')
            seen.add(m[0]); out.append(m)
    return out

def layer(col, h, o):
    """the picture the game reads: the colour divided by its own mean — the world's colour times this is the world's colour
    again on average, with the material's grain, joints and tints round it — at half scale so it fits; the height in alpha"""
    lin = col ** 2.2; mean = lin.reshape(-1, 3).mean(0); ratio = (lin / np.maximum(mean, 1e-4)) ** (1 / 2.2)
    rgb = np.clip(ratio * 0.5, 0, 1); img = np.concatenate([rgb, alpha_of(h, o['hblur'])[..., None]], -1)
    im = Image.fromarray((img * 255 + 0.5).astype(np.uint8), 'RGBA')
    if o['px'] != S: im = im.resize((o['px'], o['px']), Image.LANCZOS)
    clip = float((ratio > 2.0).any(-1).mean())
    return im, mean, clip

def build(prev=None):
    names = []; files = {}; warn = []
    for m in all_mats():
        name, maker, metres, note = m[:4]; o = opts_of(m)
        col, h = maker(); put(name, col, h, metres, note); col, h = OUT[name][:2]
        if not (np.isfinite(col).all() and np.isfinite(h).all()): raise SystemExit(f'{name}: NaN na figura')
        im, mean, clip = layer(col, h, o)
        if clip > 0.02: warn.append(f'{name}: {clip * 100:.0f}% da cor passa de 2× a média (cortada)')
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=o['q'], method=6)
        files[name] = (base64.b64encode(buf.getvalue()).decode(), metres, [round(float(q) ** (1 / 2.2), 4) for q in mean]); names.append(name)
        if prev:
            os.makedirs(prev, exist_ok=True)
            Image.fromarray((np.clip(col, 0, 1) * 255).astype(np.uint8)).save(os.path.join(prev, name + '.png'))
            Image.fromarray((np.clip(h, 0, 1) * 255).astype(np.uint8)).save(os.path.join(prev, name + '-h.png'))
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    js = ["'use strict';", '// tex3d: the materials of the 3D, made by arte/texturas.py — do not edit by hand (run it again).',
          '// each: a picture (colour over its mean, times 0.5; height in alpha) as a data URI, the metres it covers, its mean colour',
          '(function (G) {', '  G.TEX3D = {']
    for name in names:
        b, metres, mean = files[name]
        js.append(f"    {name}: {{ m: {metres}, mean: {json.dumps(mean)}, src: 'data:image/webp;base64,{b}' }},")
    js += ['  };', '})(window.G);', '']
    with open(os.path.join(root, 'js', 'tex3d.js'), 'w') as f: f.write('\n'.join(js))
    tot = sum(len(files[n][0]) for n in names)
    for w in warn: print('aviso:', w)
    print(f'{len(names)} materiais, {tot / 1e6:.2f} MB em base64 → js/tex3d.js')
    for n in names: print(f'  {n:10s} {files[n][1]:5} m  {len(files[n][0]) / 1024:6.1f} KB')
    if tot > BUDGET: raise SystemExit(f'passou do orçamento: {tot / 1e6:.2f} MB > {BUDGET / 1e6:.1f} MB')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
