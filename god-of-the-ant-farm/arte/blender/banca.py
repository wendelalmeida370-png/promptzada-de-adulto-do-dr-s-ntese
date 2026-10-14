# banca: a market stall — the size of the one build3d's stalls() draws (a counter of 1.8 × 1.0 m, 0.85 high, four posts,
# an awning over it), so it takes its place: a counter of boards with its top overhanging, the posts, an awning of
# canvas sloping to the front in stripes (two parts, two colours) with a scalloped valance, three wicker baskets with a
# heap of produce in each, two sacks tied at the neck and a crate on the ground. Parts: madeira, lona, lona2 (the
# stripes), vime, fruta (the heaps: paint them what the stall sells), saco.
# Photo: VENV/bin/python arte/blender/foto.py arte/blender/banca.py SAIDA.png
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/banca.py banca --angulo 40
# Its frame: metres, the middle of the counter on the ground at the origin, the customers' side toward Blender's -Y (the
# game's +Z).
import math
import bpy, bmesh
from mathutils import Vector, noise

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

class Part:
    def __init__(self, name, rgb): self.V, self.F, self.m = [], [], mat(name, rgb); self.name = name
    def box(self, lo, hi, ch=0.0):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for q in bm.verts: q.co = Vector([lo[k] + (q.co[k] + 0.5) * (hi[k] - lo[k]) for k in range(3)])
        if ch: bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=ch, segments=1, affect='EDGES', profile=0.5)
        self.take(bm)
    def take(self, bm, move=None):
        o = len(self.V)
        for q in bm.verts: self.V.append(q.co.copy() if move is None else move(q.co.copy()))
        self.F += [tuple(o + q.index for q in f.verts) for f in bm.faces]; bm.free()
    def quad(self, a, b, c, d, both=True):
        o = len(self.V); self.V += [Vector(a), Vector(b), Vector(c), Vector(d)]; self.F.append((o, o + 1, o + 2, o + 3))
        if both: self.F.append((o + 3, o + 2, o + 1, o))        # (a sheet of cloth is seen from under it too)
    def link(self):
        if not self.F: return
        me = bpy.data.meshes.new(self.name); me.from_pydata(self.V, [], self.F); me.validate(); me.update()
        ob = bpy.data.objects.new(self.name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(self.m)
        for p in me.polygons: p.use_smooth = True

def build():
    wood = Part('madeira', (0.35, 0.24, 0.15)); c1 = Part('lona', (0.7, 0.3, 0.22)); c2 = Part('lona2', (0.85, 0.8, 0.7))
    wick = Part('vime', (0.55, 0.42, 0.25)); fruit = Part('fruta', (0.7, 0.35, 0.2)); sack = Part('saco', (0.75, 0.68, 0.55))
    # the counter: a body of boards, the top a board overhanging it, a shelf near the ground
    wood.box((-0.88, -0.48, 0.06), (0.88, 0.48, 0.82), 0.012)
    wood.box((-0.94, -0.54, 0.82), (0.94, 0.53, 0.88), 0.012)
    wood.box((-0.86, -0.46, 0.0), (0.86, 0.46, 0.07), 0.01)
    # the posts: the back ones taller, so the awning sheds to the front
    for x in (-0.86, 0.86):
        wood.box((x - 0.035, 0.42, 0.0), (x + 0.035, 0.49, 2.38), 0.01)
        wood.box((x - 0.035, -0.53, 0.0), (x + 0.035, -0.46, 2.06), 0.01)
    # the awning: stripes across, the cloth sagging a little between the posts; the valance in scallops at the front
    NS = 7; x0, x1 = -1.02, 1.02; yb, yf = 0.52, -0.7; zb, zf = 2.4, 2.02
    def at(u, v):    # (u across 0..1, v from the back 0 to the front 1)
        x = x0 + (x1 - x0) * u; y = yb + (yf - yb) * v; z = zb + (zf - zb) * v - 0.06 * math.sin(math.pi * v) * (0.6 + 0.4 * math.sin(math.pi * u))
        return (x, y, z)
    for s in range(NS):
        part = c1 if s % 2 == 0 else c2
        for j in range(4):
            v0, v1 = j / 4, (j + 1) / 4
            for k in range(2):
                u0 = (s + k / 2) / NS; u1 = (s + (k + 1) / 2) / NS
                part.quad(at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1))
        # (the valance: a strip hanging from the front edge, its lower edge cut in a scallop)
        ua, ub = s / NS, (s + 1) / NS; xa, ya, za = at(ua, 1); xb, yb2, zb2 = at(ub, 1); xm, ym, zm = at((ua + ub) / 2, 1)
        part.quad((xa, ya, za), (xm, ym, zm), (xm, ym, zm - 0.2), (xa, ya, za - 0.13))
        part.quad((xm, ym, zm), (xb, yb2, zb2), (xb, yb2, zb2 - 0.13), (xm, ym, zm - 0.2))
    # three baskets on the counter, a heap of produce in each
    for k, bx in enumerate((-0.55, 0.0, 0.55)):
        r = 0.2 - 0.02 * (k == 1); h = 0.13
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=12, radius1=r * 0.82, radius2=r, depth=h)
        top = [f for f in bm.faces if f.normal.z > 0.9]; bmesh.ops.delete(bm, geom=top, context='FACES')    # (open at the top)
        wick.take(bm, lambda p, bx=bx, h=h: p + Vector((bx, -0.1, 0.88 + h / 2)))
        bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=r * 0.88)
        for q in bm.verts:
            q.co.z *= 0.55; q.co = q.co * (1 + noise.noise(q.co * 9 + Vector((k, 1.0, 2.0))) * 0.16)
        fruit.take(bm, lambda p, bx=bx, h=h: p + Vector((bx, -0.1, 0.88 + h * 0.75)))
        # (a few loose on top of the heap: it reads as fruit, not as a dome)
        for j in range(3):
            a = k * 1.7 + j * 2.1; bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.045)
            fruit.take(bm, lambda p, bx=bx, h=h, a=a, r=r: p + Vector((bx + math.cos(a) * r * 0.45, -0.1 + math.sin(a) * r * 0.45, 0.88 + h * 0.75 + r * 0.42)))
    # two sacks on the ground at the side, tied at the neck; a crate
    for (sx, sy, s) in ((1.12, -0.25, 1.0), (1.18, 0.2, 0.85)):
        R = 0.24 * s; bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=2, radius=R)
        for q in bm.verts:
            # (the body full, settled flat on the ground, drawn in to the tie at the neck, the gathered mouth above it)
            t = (q.co.z / R + 1) / 2
            f = 1.0 if t < 0.55 else (1 - (t - 0.55) / 0.27 * 0.72 if t < 0.82 else 0.28 + (t - 0.82) / 0.18 * 0.2)
            q.co.x *= f; q.co.y *= f; q.co.z = (max(q.co.z, -0.78 * R) + 0.78 * R) * 1.3
            q.co.x += 0.06 * R * t * t                                                     # (slumped a little to one side)
            q.co = q.co * (1 + noise.noise(q.co * 7 + Vector((sx, sy, 0))) * 0.05)
        sack.take(bm, lambda p, sx=sx, sy=sy: p + Vector((sx, sy, 0)))
    wood.box((-1.32, -0.3, 0.0), (-0.86, 0.12, 0.36), 0.015)
    for p in (wood, c1, c2, wick, fruit, sack): p.link()

build()
