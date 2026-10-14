# mat_natureza: the materials of the land and its plants that the ground and the trees of the body's 3D view still lacked
# (A3 — Terreno & Natureza), in the form of arte/texturas.py, which joins them: moss, the needles under the pines, mud,
# the round stones of a river bed. Made by hand in code, seeded: the same pictures every run, original, no licence to keep.
import numpy as np
from texlib import *

S = 512

def moss(seed=301):
    # cushions of moss: soft round mounds of every size crowding one another, each its own green, yellower where the tips
    # catch the sun, dark down in the gaps between; fine fibres all over and a few stalks standing up out of it
    r = rng(seed)
    big = fbm(S, 6, 4, seed); mid = fbm(S, 18, 3, seed + 1); grain = value_noise(S, 160, seed + 2) * 0.6 + value_noise(S, 260, seed + 3) * 0.4
    mound = smooth(0.32, 0.72, big * 0.55 + mid * 0.45)
    hue = fbm(S, 4, 3, seed + 4)
    base = ramp(hue * 0.6 + mid * 0.4, [(0, '#3c5a20'), (0.4, '#557a2a'), (0.7, '#6c8c32'), (1, '#8a9a3c')])
    col = base * (0.62 + mound[..., None] * 0.42 + (grain[..., None] - 0.5) * 0.3)
    tips = smooth(0.66, 0.85, grain) * mound; col = mix(col, hexc('#b0b45a'), tips * 0.3)
    gap = 1 - smooth(0.05, 0.3, mound); col = mix(col, hexc('#22301a'), gap * 0.6)
    items = []
    for k in range(260):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.006, 0.013); a = -np.pi / 2 + r.normal(0, 0.45)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.5, 1.0), r.uniform(0.5, 0.8)))
    st = strokes(S, items, 1.1)
    col = mix(col, hexc('#8a6e3c'), smooth(0.25, 0.65, st) * 0.55)
    h = mound * 0.6 + grain * 0.22 + st * 0.12 + (big - 0.5) * 0.1
    col *= (0.82 + 0.28 * light(h, 4))[..., None] * ao(h, 3, 1.6)[..., None]
    return col, h

def needles(seed=311):
    # the floor under the pines: needles fallen every way over dark earth, brown and rust, a little moss, a cone here and there
    r = rng(seed)
    soil = mix(hexc('#3e2e20'), hexc('#54402a'), fbm(S, 12, 4, seed))
    items = []
    for k in range(14000):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.012, 0.03); a = r.uniform(0, 2 * np.pi)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.25, 1.0), r.uniform(0.5, 0.9)))
    nd = strokes(S, items, 1.4)
    cov = smooth(0.0, 0.3, blur(nd, 0.7))
    tint = fbm(S, 6, 4, seed + 1)
    ndl = ramp(nd * 0.6 + tint * 0.4, [(0, '#5a3a20'), (0.4, '#7a4e28'), (0.7, '#9a6a36'), (1, '#b08048')])
    col = mix(soil, ndl, cov)
    moss_ = smooth(0.6, 0.75, fbm(S, 7, 4, seed + 2)); col = mix(col, hexc('#4a5a28'), moss_ * 0.55)
    # (cones: small dark ovals with their scales)
    cv, cc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.012, 0.018), r.uniform(0.006, 0.009), r.uniform(0, 3.2), 1.0) for _ in range(14)])
    col = mix(col, hexc('#4a3220') * (0.8 + 0.4 * value_noise(S, 160, seed + 3)[..., None]), cc * 0.95)
    h = 0.3 + nd * 0.35 + moss_ * 0.15 + blur(cc, 1.0) * 0.4 + (fbm(S, 20, 3, seed + 4) - 0.5) * 0.15
    col *= (0.8 + 0.3 * light(h, 3))[..., None] * ao(h, 2, 1.5)[..., None]
    return col, h

def mud(seed=321):
    # mud: dark wet earth, smooth pools lying in its hollows that shine darker, a few blades of grass and the marks of feet
    r = rng(seed)
    n = fbm(S, 8, 5, seed); n2 = fbm(S, 50, 3, seed + 1)
    col = mix(hexc('#4a3a2a'), hexc('#3a2c20'), n) * (0.9 + n2[..., None] * 0.18)
    pool = smooth(0.56, 0.64, fbm(S, 5, 4, seed + 2))
    col = mix(col, hexc('#2a2420') * (0.92 + 0.1 * n2[..., None]), pool * 0.85)
    # (prints of feet and hooves pressed into it)
    pv, pc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.01, 0.016), r.uniform(0.02, 0.03), r.uniform(0, 3.2), 1.0) for _ in range(14)])
    col = col * (1 - pc[..., None] * 0.16)
    items = []
    for k in range(900):
        x0 = r.random(); y0 = r.random(); L = r.uniform(0.008, 0.02); a = r.uniform(0, 2 * np.pi)
        items.append((x0, y0, x0 + np.cos(a) * L, y0 + np.sin(a) * L, r.uniform(0.4, 1.0), r.uniform(0.5, 1.0)))
    bl = strokes(S, items, 1.4) * (1 - pool)
    col = mix(col, hexc('#5a6a34'), smooth(0.2, 0.6, bl) * 0.7)
    h = 0.45 + (n - 0.5) * 0.3 - pool * 0.3 - pc * 0.12 + bl * 0.2 + (n2 - 0.5) * 0.05
    col *= (0.85 + 0.2 * light(h, 3))[..., None]
    return col, h

def pebbles(seed=331):
    # the bed of a river: stones the water has rounded, of every size, grey and brown, lying close with sand and grit between
    f1, f2, ids, ox, oy = voronoi(S, 15, seed, 0.8)
    rad = 0.34 + hash01(ids, seed + 1) * 0.2                     # (each stone its own size, in cell units)
    q = f1 / rad; stone = smooth(1.0, 0.86, q)                    # (round: its edge a circle round its point)
    dome = np.sqrt(np.clip(1 - q * q, 0, 1))
    n = fbm(S, 40, 3, seed + 2); tone = hash01(ids, seed + 3)
    base = ramp(tone, [(0, '#6e6a64'), (0.3, '#8a8478'), (0.55, '#9a8a74'), (0.8, '#7a7a76'), (1, '#a49e92')])
    grit = value_noise(S, 200, seed + 4); sandc = mix(hexc('#a89a7a'), hexc('#7e7058'), fbm(S, 30, 3, seed + 5)) * (0.85 + grit[..., None] * 0.25)
    col = mix(sandc, base * (0.8 + n[..., None] * 0.26) * (0.9 + dome[..., None] * 0.2), stone)
    h = dome * stone * (0.6 + rad * 0.6) + (1 - stone) * (0.08 + grit * 0.08) + (n - 0.5) * 0.03
    col *= (0.72 + 0.38 * light(h, 5))[..., None] * ao(h, 3, 2.0)[..., None]
    return col, h

MATS = [
    ('moss', moss, 1.2, 'musgo em almofadas, pontas amareladas, rachas escuras'),
    ('needles', needles, 3.0, 'chão de pinheiral: agulhas caídas, pinhas, um pouco de musgo'),
    ('mud', mud, 3.0, 'lama: terra molhada, poças nas baixas, pegadas, capim'),
    ('pebbles', pebbles, 2.4, 'leito de rio: seixos rolados com areia entre eles'),
]
