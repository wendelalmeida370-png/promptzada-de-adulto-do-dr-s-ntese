# runa: a rune stone of Hedeby — a slab of granite set upright, 2 m above the ground (and a quarter of a metre under it, so
# it never floats on a sloping lot), its front dressed nearly flat, the rest split in facets as it came from the field;
# on the front a serpent band runs up one side, over the crown and down the other, its tail curling at the foot on the
# left and its head at the foot on the right; along the band the runes are cut; three packing stones at the foot.
# Parts: pedra (the stone and the packing stones), faixa (the band, painted as they were: red), runas (the cut runes,
# dark), olho (the serpent's eye).
# Photo: VENV/bin/python arte/blender/foto.py arte/blender/runa.py SAIDA.png
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/runa.py runa --tris 1500 --angulo 55
# Its frame: metres, the foot (the ground line, at the middle of the slab) at the origin, the carved face toward
# Blender's -Y (the game's +Z).
import math
import bpy, bmesh
from mathutils import Vector, noise
from mathutils.bvhtree import BVHTree

H = 2.05; BURY = 0.25; AROUND = 20

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def link(name, verts, faces, material):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.validate(); me.update()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    return ob

# ---- the slab: rings of a rounded rectangle (a superellipse), wider a little above the ground, narrowing to the shoulders,
# the crown off the middle (one shoulder lower), then split by a few planes into facets
def ring_at(z):
    """the slab's section at height z: centre x, half width, half thickness"""
    t = (z + BURY) / (H + BURY)
    cx = 0.05 * max(0.0, t - 0.55) / 0.45 + 0.018 * math.sin(t * 7.3 + 0.6)
    hw = 0.52 + 0.06 * math.sin(math.pi * min(1.0, t * 1.5)) - 0.08 * max(0.0, t - 0.5) ** 1.5
    ht = 0.19 - 0.035 * t
    return cx, hw, ht

CUTS = [  # (a point on the plane, its normal): the planes the stone was split along — never across the carved face
    (Vector((-0.4, 0.0, 1.86)), Vector((-0.7, 0.1, 0.7)).normalized()), (Vector((0.47, 0.0, 1.72)), Vector((0.82, 0.05, 0.57)).normalized()),
    (Vector((0.56, 0.0, 0.62)), Vector((0.97, 0.0, -0.25)).normalized()), (Vector((-0.56, 0.0, 0.28)), Vector((-0.96, 0.05, -0.28)).normalized()),
    (Vector((0.1, 0.165, 1.0)), Vector((0.15, 0.985, 0.05)).normalized()), (Vector((-0.25, 0.17, 0.25)), Vector((-0.25, 0.965, -0.06)).normalized()),
]

def slab_point(cx, hw, ht, a, z, crown):
    p = 3.0
    c, s = math.cos(a), math.sin(a)
    x = cx + hw * math.copysign(abs(c) ** (2 / p), c); y = ht * math.copysign(abs(s) ** (2 / p), s)
    v = Vector((x, y, z))
    # (the field's roughness: a slow swell and a finer one, less on the dressed face)
    face = max(0.0, -s) ** 2
    k = 1 + (noise.noise(v * 1.6 + Vector((3.1, 0.7, 5.3))) * 0.045 + noise.noise(v * 5.0 + Vector((1.3, 9.1, 2.2))) * 0.012) * (1 - 0.7 * face)
    v = Vector((cx + (v.x - cx) * k, v.y * (1 + (k - 1) * 0.6), v.z + crown))
    return cut(v)

def cut(v):
    for p0, n in CUTS:
        e = (v - p0).dot(n)
        if e > 0: v = v - n * e
    return v

def slab():
    rings = []
    zs = [-BURY + (1.72 + BURY) * k / 10 for k in range(11)]
    for z in zs:
        cx, hw, ht = ring_at(z); rings.append([slab_point(cx, hw, ht, 2 * math.pi * k / AROUND, z, 0.0) for k in range(AROUND)])
    # (the crown: rings closing over the top, the highest point a little to the right)
    cx, hw, ht = ring_at(1.72)
    for k, f in enumerate([0.95, 0.84, 0.66, 0.4]):
        z = 1.72 + (H - 1.72) * math.sin(math.acos(f)); rings.append([slab_point(cx + 0.05 * (1 - f), hw * f, ht * (0.4 + 0.6 * f), 2 * math.pi * j / AROUND, z, 0.0) for j in range(AROUND)])
    V = [v for r in rings for v in r]; F = []
    for i in range(len(rings) - 1):
        for j in range(AROUND):
            a = i * AROUND + j; b = i * AROUND + (j + 1) % AROUND
            F.append((a, b, b + AROUND, a + AROUND))
    top = len(V); V.append(cut(Vector((cx + 0.06, -0.01, H)))); last = (len(rings) - 1) * AROUND
    for j in range(AROUND): F.append((last + j, last + (j + 1) % AROUND, top))
    bot = len(V); V.append(Vector((0.0, 0.0, -BURY)))
    for j in range(AROUND): F.append((bot, (j + 1) % AROUND, j))
    return V, F

def packing():
    """three packing stones at the foot, half sunk (an object of their own: the band is laid on the slab alone)"""
    V, F = [], []
    for (px, py, r) in [(-0.55, -0.12, 0.13), (0.5, -0.16, 0.11), (0.12, 0.26, 0.12)]:
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)
        for q in bm.verts:
            q.co.x *= 1.25; q.co.z *= 0.7
            q.co = q.co * (1 + noise.noise(q.co * 6 + Vector((px, py, 1.0))) * 0.18) + Vector((px, py, -0.03))
        o = len(V); V += [q.co.copy() for q in bm.verts]; F += [tuple(o + q.index for q in f.verts) for f in bm.faces]; bm.free()
    return V, F

# ---- the band: the front's outline drawn in by an inset, raised a little off the stone, its width easing into a head
# at one end and a curling tail at the other
def outline():
    """the front's silhouette from the foot on the left over the crown to the foot on the right, as (x, z)"""
    L, R = [], []
    for k in range(40):
        z = 0.06 + (1.72 - 0.06) * k / 39; cx, hw, ht = ring_at(z); L.append((cx - hw * 0.985, z)); R.append((cx + hw * 0.985, z))
    cx, hw, ht = ring_at(1.72)
    top = []
    for k in range(1, 18):
        a = math.pi - math.pi * k / 18
        top.append((cx + 0.03 + hw * 0.985 * math.cos(a), 1.72 + (H - 1.72 - 0.03) * math.sin(a)))
    return L + top + R[::-1]

def offset(pts, d):
    out = []
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, tz) or 1; nx, nz = tz / l, -tx / l   # (right of the way: inward)
        out.append((p[0] + nx * d, p[1] + nz * d))
    return out

def resample(pts, step):
    out = [pts[0]]; acc = 0.0
    for i in range(1, len(pts)):
        a = Vector((*pts[i - 1], 0)); b = Vector((*pts[i], 0)); seg = (b - a).length
        while acc + seg >= step:
            t = (step - acc) / seg; a = a.lerp(b, t); out.append((a.x, a.y)); seg = (b - a).length; acc = 0.0
        acc += seg
    return out

def band_path():
    core = resample(offset(outline(), 0.14), 0.05)
    # (the tail: from the left foot curling in and up; the head: from the right foot reaching in along the ground)
    x0, z0 = core[0]; tail = []
    for k in range(7, 0, -1):
        a = math.pi * 0.5 + k * 0.38; r = 0.03 + 0.012 * k
        tail.append((x0 + 0.045 + r * math.cos(a) * 0.9, z0 - 0.02 + r * math.sin(a) * 0.9 - 0.05 * (k / 7)))
    x1, z1 = core[-1]; head = []
    for k in range(1, 7):
        head.append((x1 - 0.02 - 0.05 * k, z1 - 0.03 * min(k, 3) + 0.004 * k * k * 0.3))
    pts = tail + core + head
    n = len(pts); W = []
    for i in range(n):
        if i < len(tail): w = 0.02 + 0.08 * (i / len(tail))                   # (the tail thins to a point)
        elif i >= n - len(head):
            j = i - (n - len(head)); w = [0.13, 0.155, 0.16, 0.14, 0.1, 0.045][j]   # (the head: wider, then the snout)
        else: w = 0.1
        W.append(w)
    return pts, W, len(tail), len(head)

def band(stone):
    dg = bpy.context.evaluated_depsgraph_get(); bvh = BVHTree.FromObject(stone, dg)
    def on(x, z, lift):
        hit = bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0)))
        if hit[0] is None: return Vector((x, -0.2 - lift, z)), Vector((0, -1, 0))
        n = hit[1] if hit[1].y < 0 else -hit[1]
        return hit[0] + n * lift, n
    pts, W, nt, nh = band_path(); n = len(pts)
    def flat(x, z):
        hit = bvh.ray_cast(Vector((x, -1.5, z)), Vector((0, 1, 0)))
        return hit[0] is not None and abs(hit[1].y) > 0.93
    for i in range(n):
        a = pts[max(0, i - 1)]; b = pts[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, tz) or 1; nx, nz = tz / l, -tx / l
        x, z = pts[i]
        for k in range(8):
            if flat(x - nx * (W[i] / 2 + 0.02), z - nz * (W[i] / 2 + 0.02)): break
            x += nx * 0.012; z += nz * 0.012
        pts[i] = (x, z)
    # (and the steps smoothed, so the band bends instead of jogging)
    for it in range(3):
        pts = [pts[0]] + [((pts[i - 1][0] + 2 * pts[i][0] + pts[i + 1][0]) / 4, (pts[i - 1][1] + 2 * pts[i][1] + pts[i + 1][1]) / 4) for i in range(1, n - 1)] + [pts[-1]]
    V, F = [], []; RISE = 0.014
    frames = []
    for i, p in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, tz) or 1; nx, nz = tz / l, -tx / l
        w = W[i] / 2
        L0, _ = on(p[0] - nx * w, p[1] - nz * w, -0.004); R0, _ = on(p[0] + nx * w, p[1] + nz * w, -0.004)
        L1, _ = on(p[0] - nx * w, p[1] - nz * w, RISE); R1, nn = on(p[0] + nx * w, p[1] + nz * w, RISE)
        o = len(V); V += [L0, L1, R1, R0]; frames.append((p, (tx / l, tz / l), (nx, nz), W[i]))
        if i:
            q = o - 4
            F += [(q + 1, q + 2, o + 2, o + 1), (q, q + 1, o + 1, o), (q + 2, q + 3, o + 3, o + 2)]
    F += [(0, 3, 2, 1), (len(V) - 4, len(V) - 3, len(V) - 2, len(V) - 1)]
    # the runes: along the band, between the tail and the head, a stave across the band and a branch or two
    RV, RF = [], []
    def stroke(x0, z0, x1, z1, wd=0.0075):
        dx, dz = x1 - x0, z1 - z0; l = math.hypot(dx, dz) or 1; px, pz = -dz / l * wd / 2, dx / l * wd / 2
        o = len(RV)
        for (x, z) in [(x0 + px, z0 + pz), (x0 - px, z0 - pz), (x1 - px, z1 - pz), (x1 + px, z1 + pz)]:   # (facing out of the stone)
            RV.append(on(x, z, RISE + 0.0035)[0])
        RF.append((o, o + 1, o + 2, o + 3))
    import random
    rnd = random.Random(7)
    i = nt + 2; k = 0
    while i < n - nh - 2:
        (px_, pz_), (tx, tz), (nx, nz), w = frames[i]
        hh = w * 0.34
        stroke(px_ - nx * hh, pz_ - nz * hh, px_ + nx * hh, pz_ + nz * hh)                    # (the stave, across the band)
        kind = rnd.randrange(6)
        if kind in (0, 1, 2):                                                                 # (a branch from its top)
            s = 1 if kind != 1 else -1
            stroke(px_ + nx * hh, pz_ + nz * hh, px_ + nx * hh * 0.25 + tx * 0.03 * s, pz_ + nz * hh * 0.25 + tz * 0.03 * s)
        if kind in (2, 3):                                                                    # (a branch from its middle)
            stroke(px_, pz_, px_ - nx * hh * 0.6 + tx * 0.028, pz_ - nz * hh * 0.6 + tz * 0.028)
        i += 2 if rnd.random() < 0.82 else 3                                                  # (a gap now and then: a word ends)
        k += 1
    # the serpent's eye: a small dome on the head
    (hx, hz), _, _, _ = frames[n - nh + 1]
    c, nrm = on(hx, hz + 0.01, RISE); bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.018)
    EV = [c + Vector((q.co.x, q.co.y * 0.5, q.co.z)) for q in bm.verts]; EF = [tuple(q.index for q in f.verts) for f in bm.faces]; bm.free()
    return (V, F), (RV, RF), (EV, EF), k

def build():
    stone_m = mat('pedra', (0.42, 0.41, 0.39)); band_m = mat('faixa', (0.55, 0.2, 0.14)); rune_m = mat('runas', (0.12, 0.09, 0.07)); eye_m = mat('olho', (0.85, 0.82, 0.7))
    V, F = slab(); stone = link('pedra', V, F, stone_m)
    bpy.context.view_layer.update()
    V, F = packing(); link('calcos', V, F, stone_m)
    (bv, bf), (rv, rf), (ev, ef), runes = band(stone)
    link('faixa', bv, bf, band_m); link('runas', rv, rf, rune_m); link('olho', ev, ef, eye_m)
    print(f'runa: {runes} runas na faixa')

build()
