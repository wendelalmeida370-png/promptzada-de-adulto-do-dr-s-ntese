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
    col = col * (0.25 + 0.75 * gap[..., None])
    col *= (0.88 + 0.12 * light(h, 6))[..., None]
    if not vertical: col = np.transpose(col, (1, 0, 2)); h = h.T
    return col, h

def beams(seed=21):
    r = rng(seed); x, y = grid(S)
    fib = value_noise(S, 160, seed, 3) * 0.5 + value_noise(S, 60, seed + 1, 2) * 0.5; gn = fbm(S, 5, 4, seed + 2, ny=1)
    rings = np.sin((x * 9 + gn * 5) * np.pi * 2) * 0.5 + 0.5
    checks = smooth(0.03, 0.0, np.abs(value_noise(S, 18, seed + 3, 1) - 0.5)) * smooth(0.5, 0.75, value_noise(S, 4, seed + 4, 1))
    col = mix(hexc('#5a3e28'), hexc('#3e2a1c'), rings * 0.5 + fib * 0.5)
    col = col * (1 - checks[..., None] * 0.7)
    h = 0.7 + (fib - 0.5) * 0.15 - checks * 0.5
    col *= (0.85 + 0.15 * light(h, 5))[..., None]
    return col, h

def stonewall(seed=31):
    f1, f2, ids, ox, oy = voronoi(S, 7, seed, 0.85, ny=11, stretch=(1.0, 1.6))
    e = f2 - f1; stone = smooth(0.03, 0.12, e)
    n1 = fbm(S, 16, 4, seed + 1); n2 = fbm(S, 64, 3, seed + 2)
    tone = hash01(ids, seed + 3); kind = hash01(ids, seed + 4)
    base = mix(hexc('#8e8a82'), hexc('#6c6a66'), tone)
    base = mix(base, hexc('#8a7a66'), smooth(0.6, 0.9, kind) * 0.7); base = mix(base, hexc('#6e7680'), smooth(0.4, 0.1, kind) * 0.5)
    dome = smooth(0.0, 0.35, e) ** 0.6
    h = dome * (0.75 + (n1 - 0.5) * 0.35) + (n2 - 0.5) * 0.06
    mortar = mix(hexc('#a8a294'), hexc('#8a857a'), n2)
    col = mix(mortar * 0.8, base * (0.8 + n1[..., None] * 0.35), stone)
    lichen = smooth(0.66, 0.74, fbm(S, 12, 4, seed + 5)) * stone
    col = mix(col, hexc('#b2b47a'), lichen * 0.45)
    col *= (0.72 + 0.4 * light(h, 5))[..., None] * ao(h, 4, 2.0)[..., None]
    return col, h

def brick(seed=41):
    r = rng(seed); x, y = grid(S); rows = 16; cols = 6
    ry = y * rows; row = np.floor(ry).astype(int); fy = ry - row
    rx = x * cols + (row % 2) * 0.5 + hash01(row % rows, seed) * 0.15; cl = np.floor(rx).astype(int); fx = rx - cl
    bid = (row % rows) * 64 + (cl % cols)
    n = fbm(S, 32, 4, seed + 1); ch = fbm(S, 48, 3, seed + 2)
    edge = np.minimum(np.minimum(fx, 1 - fx) * 2.6, np.minimum(fy, 1 - fy)) + (ch - 0.5) * 0.05
    b = smooth(0.06, 0.12, edge)
    tone = hash01(bid, seed + 3)
    base = ramp(tone, [(0, '#8a4a34'), (0.5, '#a85c3e'), (0.85, '#b87a56'), (1, '#6a3a2c')])
    col = mix(hexc('#a09888') * (0.8 + n[..., None] * 0.3), base * (0.85 + n[..., None] * 0.3), b)
    h = b * (0.8 + (n - 0.5) * 0.2)
    col *= (0.8 + 0.25 * light(h, 4))[..., None]
    return col, h

def plaster(seed=51):
    x, y = grid(S)
    big = fbm(S, 4, 4, seed); mid = fbm(S, 14, 4, seed + 1); fine = fbm(S, 90, 2, seed + 2)
    col = mix(hexc('#efe8dc'), hexc('#ddd2c0'), smooth(0.35, 0.75, big))
    col = col * (0.94 + mid[..., None] * 0.1 + (fine[..., None] - 0.5) * 0.08)
    # (stains, where the rain ran down from the eaves; a hairline crack now and then)
    st = value_noise(S, 24, seed + 3, 2); col = mix(col, col * np.array([0.88, 0.86, 0.8]), smooth(0.6, 0.85, st) * smooth(0.4, 0.7, big) * 0.6)
    f1, f2, ids, _, _ = voronoi(S, 5, seed + 4); crack = smooth(0.02, 0.0, f2 - f1) * (hash01(ids, seed + 5) > 0.7) * smooth(0.45, 0.6, mid)
    col = col * (1 - crack[..., None] * 0.35)
    h = 0.6 + (mid - 0.5) * 0.12 + (fine - 0.5) * 0.08 - crack * 0.3
    col *= (0.92 + 0.1 * light(h, 4))[..., None]
    return col, h

def turf(seed=61):
    r = rng(seed); x, y = grid(S)
    soil = mix(hexc('#4a3a26'), hexc('#5e4a32'), fbm(S, 20, 3, seed))
    moss = smooth(0.52, 0.7, fbm(S, 6, 4, seed + 1)); dry = smooth(0.55, 0.75, fbm(S, 4, 4, seed + 2))
    # the blades: thousands of short strokes hanging down the slope (+y), each its own green
    items = []
    for k in range(9000):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.012, 0.035); a = np.pi / 2 + r.normal(0, 0.35)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.35, 1.0), r.uniform(0.6, 1.2)))
    bl = strokes(S, items, 2.0)
    cov = smooth(0.05, 0.5, blur(bl, 0.8))
    green = mix(hexc('#5e8a3a'), hexc('#7aa048'), bl)
    green = mix(green, hexc("#a8a058"), dry * 0.6 * bl)
    green = mix(green, hexc('#4a6a34'), moss * 0.6)
    col = mix(soil, green, np.maximum(cov, moss * 0.8))
    # (a few small flowers in the turf)
    fl, fc = stamp_ellipses(S, [(r.random(), r.random(), 0.004, 0.004, 0, r.integers(1, 3)) for _ in range(70)])
    col = mix(col, np.where((fl > 1.5)[..., None], hexc('#f0e6c8'), hexc('#e8c84a')), fc * 0.9)
    h = 0.3 + bl * 0.55 + moss * 0.15 + (fbm(S, 8, 3, seed + 4) - 0.5) * 0.2
    col *= (0.75 + 0.35 * light(h, 3))[..., None] * ao(h, 3, 1.5)[..., None]
    return col, h

def thatch(seed=71):
    r = rng(seed); x, y = grid(S); rows = 7
    ry = y * rows + (value_noise(S, 6, seed, 1) - 0.5) * 0.4; row = np.floor(ry).astype(int); fy = ry - row
    items = []
    for k in range(7000):
        x0 = r.random(); yr = r.integers(0, rows); y0 = (yr + r.uniform(0, 0.4)) / rows; L = r.uniform(0.07, 0.14); a = np.pi / 2 + r.normal(0, 0.06)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.3, 1.0), r.uniform(0.5, 1.0)))
    st = strokes(S, items, 1.6)
    over = smooth(1.0, 0.75, fy)  # (the lower edge of each course, curling over the next)
    base = mix(hexc('#a8884e'), hexc('#c8a862'), st)
    weath = smooth(0.5, 0.8, fbm(S, 5, 4, seed + 1)); base = mix(base, hexc('#8a8270'), weath * 0.55)
    col = base * (0.55 + 0.45 * (1 - over)[..., None] + st[..., None] * 0.2)
    h = (1 - fy) * 0.5 + st * 0.35 + 0.1
    col *= (0.82 + 0.25 * light(h, 4))[..., None]
    return col, h

def tiles(seed=81):
    x, y = grid(S); rows = 9; cols = 7
    ry = y * rows; row = np.floor(ry).astype(int); fy = ry - row
    rx = x * cols + (row % 2) * 0.5; cl = np.floor(rx).astype(int); fx = rx - cl
    tid = (row % rows) * 32 + (cl % cols)
    prof = np.sin(fx * np.pi) ** 0.7  # (each tile curved across)
    lip = smooth(0.0, 0.18, 1 - fy)   # (its lower lip over the next course)
    n = fbm(S, 24, 4, seed); tone = hash01(tid, seed + 1)
    base = ramp(tone, [(0, '#9a4a32'), (0.45, '#b4583a'), (0.8, '#c06a44'), (0.93, '#8a5a40'), (1, '#6a3a2a')])
    moss = smooth(0.62, 0.78, fbm(S, 8, 4, seed + 2)) * smooth(0.6, 1.0, fy)
    col = base * (0.7 + prof[..., None] * 0.35) * (0.6 + 0.4 * lip[..., None]) * (0.9 + n[..., None] * 0.2)
    col = mix(col, hexc('#7a8a4a'), moss * 0.5)
    h = prof * 0.5 + (1 - fy) * 0.35 + (n - 0.5) * 0.05
    col *= (0.85 + 0.2 * light(h, 4))[..., None]
    return col, h

def shingles(seed=91):
    x, y = grid(S); rows = 10
    ry = y * rows; row = np.floor(ry).astype(int); fy = ry - row
    r = rng(seed); offs = r.random(rows)
    # (shingles of uneven width, staggered each course)
    w = 0.11; rx = x / w + offs[row % rows] * 3.7; cl = np.floor(rx).astype(int); fx = rx - cl
    sid = (row % rows) * 64 + (cl % 64)
    fib = value_noise(S, 6, seed + 1, 160).T if False else value_noise(S, 200, seed + 1, 8)
    tone = hash01(sid, seed + 2)
    base = mix(hexc('#6e5038'), hexc('#8a6a4a'), tone); base = mix(base, hexc('#77746c'), smooth(0.6, 0.9, hash01(sid, seed + 3)) * 0.6)
    gap = smooth(0.0, 0.05, np.minimum(fx, 1 - fx)); lip = smooth(0.0, 0.12, 1 - fy)
    col = base * (0.8 + fib[..., None] * 0.3) * (0.3 + 0.7 * gap[..., None]) * (0.6 + 0.4 * lip[..., None])
    h = ((1 - fy) * 0.45 + 0.4) * gap + (fib - 0.5) * 0.05
    col *= (0.85 + 0.2 * light(h, 4))[..., None]
    return col, h

def slabs(seed=101):
    f1, f2, ids, _, _ = voronoi(S, 5, seed, 0.75, ny=5)
    e = f2 - f1; s = smooth(0.025, 0.07, e); n = fbm(S, 20, 4, seed + 1); n2 = fbm(S, 80, 2, seed + 2)
    tone = hash01(ids, seed + 3)
    base = mix(hexc('#a09a8e'), hexc('#7e7a72'), tone); base = mix(base, hexc('#a08a72'), smooth(0.7, 0.95, hash01(ids, seed + 4)) * 0.6)
    joint = mix(hexc('#5a5040'), hexc('#5a7a3a'), smooth(0.4, 0.7, fbm(S, 10, 3, seed + 5)))  # (grass in some joints)
    col = mix(joint, base * (0.85 + n[..., None] * 0.25 + (n2[..., None] - 0.5) * 0.1), s)
    h = s * (0.7 + (n - 0.5) * 0.15) + smooth(0.0, 0.25, e) * 0.15
    col *= (0.82 + 0.25 * light(h, 4))[..., None] * ao(h, 3, 1.5)[..., None]
    return col, h

def cobble(seed=111):
    f1, f2, ids, ox, oy = voronoi(S, 13, seed, 0.9)
    e = f2 - f1; dome = smooth(0.0, 0.45, e) ** 0.55; s = smooth(0.04, 0.1, e)
    n = fbm(S, 40, 3, seed + 1); tone = hash01(ids, seed + 2)
    base = ramp(tone, [(0, '#7a766e'), (0.4, '#948e84'), (0.75, '#8a8072'), (1, '#6a6660')])
    gras = smooth(0.45, 0.65, fbm(S, 8, 4, seed + 3))
    joint = mix(hexc('#4a4032'), hexc('#4e6a30'), gras)
    col = mix(joint, base * (0.8 + n[..., None] * 0.3), s)
    h = dome * 0.8 + (n - 0.5) * 0.05
    col *= (0.7 + 0.4 * light(h, 5))[..., None] * ao(h, 3, 2.0)[..., None]
    return col, h

def bark(seed=121):
    f1, f2, ids, ox, oy = voronoi(S, 9, seed, 0.85, ny=3, stretch=(1.0, 0.33))
    e = f2 - f1; plate = smooth(0.02, 0.16, e)
    fib = value_noise(S, 120, seed + 1, 6); n = fbm(S, 16, 4, seed + 2)
    tone = hash01(ids, seed + 3)
    base = mix(hexc('#6a5038'), hexc('#4e3a2a'), tone)
    col = base * (0.75 + plate[..., None] * 0.4 + (fib[..., None] - 0.5) * 0.2)
    col = col * (0.35 + 0.65 * plate[..., None])
    moss = smooth(0.6, 0.75, fbm(S, 6, 4, seed + 4)) * plate
    col = mix(col, hexc('#5a6a34'), moss * 0.5)
    h = plate * (0.6 + (n - 0.5) * 0.3) + fib * 0.1
    col *= (0.8 + 0.3 * light(h, 5))[..., None]
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
    r = rng(seed); x, y = grid(S)
    n = fbm(S, 10, 5, seed); n2 = fbm(S, 60, 3, seed + 1)
    col = mix(hexc('#8a7050'), hexc('#6e5638'), n) * (0.9 + n2[..., None] * 0.2)
    damp = smooth(0.55, 0.75, fbm(S, 4, 4, seed + 2)); col = col * (1 - damp[..., None] * 0.18)
    pv, pc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.003, 0.012), r.uniform(0.003, 0.009), r.uniform(0, 3), r.uniform(0.4, 1.0)) for _ in range(900)])
    peb = blur(pc, 0.6); col = mix(col, mix(hexc('#8a8478'), hexc('#a8a092'), pv) , pc * 0.9)
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 3); crack = smooth(0.012, 0.0, f2 - f1) * smooth(0.5, 0.7, fbm(S, 6, 3, seed + 4))
    col = col * (1 - crack[..., None] * 0.4)
    h = 0.4 + (n - 0.5) * 0.25 + peb * 0.35 - crack * 0.2 + (n2 - 0.5) * 0.05
    col *= (0.8 + 0.3 * light(h, 4))[..., None] * ao(h, 2, 1.5)[..., None]
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
    x, y = grid(S)
    wv = fbm(S, 4, 4, seed)
    strata = np.sin((y * 11 + wv * 3.5) * np.pi * 2) * 0.5 + 0.5
    f1, f2, ids, _, _ = voronoi(S, 6, seed + 1, 0.9, ny=4); crack = smooth(0.03, 0.0, f2 - f1)
    n = fbm(S, 24, 5, seed + 2); tone = hash01(ids, seed + 3)
    col = ramp(strata * 0.6 + tone * 0.4, [(0, '#6e6a64'), (0.4, '#8a847a'), (0.7, '#9e968a'), (1, '#7a746a')]) * (0.82 + n[..., None] * 0.3)
    col = col * (1 - crack[..., None] * 0.55)
    lichen = smooth(0.66, 0.75, fbm(S, 10, 4, seed + 4)); col = mix(col, hexc('#a8ac70'), lichen * 0.4)
    h = 0.5 + strata * 0.15 + (n - 0.5) * 0.35 - crack * 0.35
    col *= (0.75 + 0.4 * light(h, 5))[..., None] * ao(h, 4, 2.0)[..., None]
    return col, h

def gravel(seed=171):
    f1, f2, ids, ox, oy = voronoi(S, 34, seed, 0.95)
    e = f2 - f1; dome = smooth(0.0, 0.4, e) ** 0.6; s = smooth(0.02, 0.09, e); tone = hash01(ids, seed + 1)
    base = ramp(tone, [(0, '#7a746a'), (0.5, '#a49c8e'), (0.8, '#8e8678'), (1, '#b2aa9a')])
    col = mix(hexc('#5a5040'), base, s)
    h = dome * 0.8
    col *= (0.7 + 0.4 * light(h, 5))[..., None] * ao(h, 2, 2.0)[..., None]
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
    r = rng(seed); x, y = grid(S)
    col = mix(hexc('#4a3a28'), hexc('#5e4a32'), fbm(S, 16, 4, seed))
    items = [(r.random(), r.random(), r.uniform(0.006, 0.014), r.uniform(0.003, 0.007), r.uniform(0, 3.2), r.uniform(0, 1)) for _ in range(2600)]
    lv, lc = stamp_ellipses(S, items)
    leaf = ramp(lv, [(0, '#6a4a2a'), (0.35, '#8a5e30'), (0.6, '#a07a3a'), (0.8, '#5a6a30'), (1, '#7a5030')])
    col = mix(col, leaf, lc)
    moss = smooth(0.58, 0.72, fbm(S, 6, 4, seed + 1)); col = mix(col, hexc('#4e6a2e'), moss * 0.7)
    h = 0.3 + lc * 0.3 + moss * 0.2 + fbm(S, 30, 3, seed + 2) * 0.15
    col *= (0.8 + 0.3 * light(h, 3))[..., None] * ao(h, 2, 1.5)[..., None]
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
    ('turf', turf, 2.0, 'telhado de turfa: touceiras, musgo, partes secas, florzinhas'),
    ('thatch', thatch, 2.0, 'palha em fiadas'),
    ('tile', tiles, 2.0, 'telha de barro curva, cada uma de um tom, musgo'),
    ('shingle', shingles, 2.0, 'telhas de madeira'),
    ('slab', slabs, 3.0, 'lajes de pedra com grama nas juntas'),
    ('cobble', cobble, 2.6, 'calçamento de paralelepípedo com terra e grama entre as pedras'),
    ('bark', bark, 1.4, 'casca de árvore em placas, com musgo'),
    ('grass', grass, 4.0, 'chão de capim: folhas, trevo, florzinhas, terra aparecendo'),
    ('dirt', dirt, 4.0, 'terra batida com seixos e rachaduras'),
    ('sand', sand, 4.0, 'areia com ondulações'),
    ('rock', rock, 6.0, 'rocha em camadas, fraturas e líquen'),
    ('gravel', gravel, 3.0, 'cascalho'),
    ('snow', snow, 5.0, 'neve com sombra azul'),
    ('forest', forest, 4.0, 'chão de mata: folhas secas e musgo'),
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

def build(prev=None):
    names = []; rows = []
    for name, maker, metres, note in all_mats():
        col, h = maker(); put(name, col, h, metres, note); names.append(name)
    # (the picture the game reads: the colour divided by its own mean — the world's colour times this is the world's colour
    # again on average, with the material's grain, joints and tints round it — at half scale so it fits; the height in alpha)
    files = {}
    for name in names:
        col, h, metres, note = OUT[name]
        lin = col ** 2.2; mean = lin.reshape(-1, 3).mean(0); ratio = (lin / np.maximum(mean, 1e-4)) ** (1 / 2.2)
        rgb = np.clip(ratio * 0.5, 0, 1); img = np.concatenate([rgb, h[..., None]], -1)
        im = Image.fromarray((img * 255 + 0.5).astype(np.uint8), 'RGBA'); buf = io.BytesIO(); im.save(buf, 'WEBP', quality=86, method=6)
        files[name] = (base64.b64encode(buf.getvalue()).decode(), metres, [round(float(m) ** (1 / 2.2), 4) for m in mean])
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
    print(f'{len(names)} materiais, {tot / 1e6:.2f} MB em base64 → js/tex3d.js')

if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else None)
