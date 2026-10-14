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

def stony(seed=341):
    # stony ground: broken stones of every size, angular, half sunk in dry earth — their tops lit, their edges worn —
    # with grit and small chips between them
    r = rng(seed)
    soil = mix(hexc('#7a6a56'), hexc('#5e5244'), fbm(S, 10, 4, seed)) * (0.9 + value_noise(S, 180, seed + 1)[..., None] * 0.2)
    h = 0.22 + (fbm(S, 12, 3, seed + 2) - 0.5) * 0.1; col = soil
    for (n, keepP, sd) in ((5, 0.45, 3), (11, 0.6, 4), (24, 0.7, 5)):
        f1, f2, ids, ox, oy = voronoi(S, n, seed + sd * 10, 0.9)
        e = f2 - f1 + (fbm(S, n * 4, 2, seed + sd * 7) - 0.5) * 0.08     # (the stone's own rough edge)
        gap = 0.12 + hash01(ids, seed + sd) * 0.22                        # (each sunk its own depth: more or less of it shows)
        keep = hash01(ids, seed + sd + 50) < keepP
        st = smooth(gap, gap + 0.06, e) * keep
        dome = smooth(gap, gap + 0.45, e) ** 0.6
        tone = hash01(ids, seed + sd + 9)
        sc = ramp(tone, [(0, '#74706a'), (0.35, '#8c867c'), (0.7, '#a0988a'), (1, '#6a645e')]) * (0.8 + fbm(S, 60, 2, seed + sd)[..., None] * 0.32)
        hs = 0.3 + dome * (0.4 + 2.0 / n)
        up = st * (hs > h)
        col = mix(col, sc, up); h = np.where(up > 0.5, hs, h)
    chips, cc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.002, 0.005), r.uniform(0.002, 0.004), r.uniform(0, 3), 1.0) for _ in range(600)])
    col = mix(col, hexc('#9a9284'), cc * 0.8); h = h + cc * 0.06
    col *= (0.7 + 0.42 * light(h, 6))[..., None] * ao(h, 3, 2.2)[..., None]
    return col, h

def trail(seed=351):
    # a trodden path: earth packed hard by the feet and the wheels, smooth and a little shiny, fine cracks, a few small
    # stones pressed into it, dust lighter on its highs
    r = rng(seed)
    n = fbm(S, 6, 5, seed); n2 = fbm(S, 40, 3, seed + 1)
    col = mix(hexc('#8a7458'), hexc('#76624a'), n) * (0.93 + n2[..., None] * 0.12)
    dust = smooth(0.55, 0.75, fbm(S, 9, 3, seed + 2)); col = mix(col, hexc('#a08a6a'), dust * 0.35)
    f1, f2, ids, _, _ = voronoi(S, 7, seed + 3); crack = smooth(0.01, 0.0, f2 - f1) * smooth(0.45, 0.7, fbm(S, 5, 3, seed + 4))
    col = col * (1 - crack[..., None] * 0.3)
    pv, pc = stamp_ellipses(S, [(r.random(), r.random(), r.uniform(0.003, 0.008), r.uniform(0.003, 0.006), r.uniform(0, 3), r.uniform(0.5, 1.0)) for _ in range(160)])
    col = mix(col, mix(hexc('#7e786c'), hexc('#9a9284'), pv), pc * 0.85)
    h = 0.45 + (n - 0.5) * 0.12 + blur(pc, 0.6) * 0.25 - crack * 0.12 + (n2 - 0.5) * 0.04
    col *= (0.86 + 0.18 * light(h, 3))[..., None]
    return col, h

def crag(seed=361):
    # rock of a crag or a boulder: layers laid down long ago and bent, each its own grey and brown, weathered smooth on their
    # faces; joints running across the layers and a few long cracks (the ridges of a slow noise, not the cells of a
    # pattern), pits, and lichen
    x, y = grid(S)
    wv = fbm(S, 3, 4, seed); wv2 = fbm(S, 9, 3, seed + 1)
    layer = y * 6 + wv * 2.2 + wv2 * 0.4
    band = np.sin(layer * np.pi * 2) * 0.5 + 0.5; lid = np.floor(layer).astype(int) % 6
    tone = np.array([0.12, 0.66, 0.32, 0.9, 0.48, 0.22], np.float32)[lid]
    base = ramp(tone * 0.6 + band * 0.4, [(0, '#66625c'), (0.35, '#827c72'), (0.65, '#9c9486'), (1, '#7a7266')])
    n = fbm(S, 20, 5, seed + 2); fine = value_noise(S, 220, seed + 3)
    col = base * (0.84 + n[..., None] * 0.26 + (fine[..., None] - 0.5) * 0.1)
    # (the layer lines themselves, a thin darker seam between two layers)
    seam = smooth(0.06, 0.0, np.abs(((layer + 0.5) % 1.0) - 0.5)) * smooth(0.3, 0.6, fbm(S, 6, 2, seed + 10))
    # (joints across the layers, broken; and a few long cracks)
    d = np.abs(((x * 4 + wv * 0.5 + 0.5) % 1.0) - 0.5); joint = smooth(0.014, 0.0, d) * smooth(0.5, 0.65, fbm(S, 3, 2, seed + 11, ny=6))
    c1 = np.abs(fbm(S, 3, 2, seed + 4) - 0.5); crack = smooth(0.012, 0.0, c1) * smooth(0.45, 0.65, fbm(S, 4, 2, seed + 6))
    lines = np.maximum(np.maximum(seam * 0.45, joint * 0.8), crack)
    col = col * (1 - lines[..., None] * 0.5)
    pits = smooth(0.8, 0.9, fine) * smooth(0.5, 0.8, n); col = col * (1 - pits[..., None] * 0.16)
    lichen = smooth(0.64, 0.74, fbm(S, 8, 4, seed + 8)); col = mix(col, hexc('#a4a670'), lichen * 0.35)
    lichen2 = smooth(0.7, 0.78, fbm(S, 14, 3, seed + 9)); col = mix(col, hexc('#c8c4b4'), lichen2 * 0.28)
    h = 0.5 + band * 0.2 + (n - 0.5) * 0.3 - lines * 0.35 - pits * 0.08 + lichen * 0.04
    col *= (0.78 + 0.34 * light(h, 4))[..., None] * ao(h, 4, 1.8)[..., None]
    return col, h

MATS = [
    ('moss', moss, 1.2, 'musgo em almofadas, pontas amareladas, rachas escuras'),
    ('needles', needles, 3.0, 'chão de pinheiral: agulhas caídas, pinhas, um pouco de musgo'),
    ('mud', mud, 3.0, 'lama: terra molhada, poças nas baixas, pegadas, capim'),
    ('pebbles', pebbles, 2.4, 'leito de rio: seixos rolados com areia entre eles'),
    ('stony', stony, 3.0, 'chão pedregoso: pedras de todo tamanho meio enterradas na terra seca'),
    ('trail', trail, 4.0, 'trilha: terra batida pelos pés e rodas, rachas finas, pedrinhas'),
    ('crag', crag, 5.0, 'rocha de penhasco e rochedo: camadas dobradas, rachas que vagueiam, líquen'),
]
