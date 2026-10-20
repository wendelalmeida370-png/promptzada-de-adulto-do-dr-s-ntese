# portal: the carved door frame of a northern longhouse — two posts and a heavy lintel round a door of 1.0 × 1.9 m, a
# threshold beam under it; on the front of each post and along the lintel two ribbons of interlace (the carvers' beasts
# reduced to their bodies) plait over and under each other, standing a little out of the wood. Every edge of the timber
# chamfered. Parts: madeira (the posts, the lintel, the threshold), entalhe (the interlace: paint it the people's trim,
# as they were painted, or a shade of the wood).
# Photo: VENV/bin/python arte/blender/foto.py arte/blender/portal.py SAIDA.png
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/portal.py portal --tris 1200 --angulo 50
# Its frame: metres, the foot of the door (the ground, the middle of the threshold) at the origin, the carved face toward
# Blender's -Y (the game's +Z, out of the house). The opening: x from -0.5 to 0.5, from 0.12 (the threshold's top) to 2.0.
import math
import bpy, bmesh
from mathutils import Vector

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def link(name, verts, faces, material):
    me = bpy.data.meshes.new(name); me.from_pydata(verts, [], faces); me.validate(); me.update()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(material)
    for p in me.polygons: p.use_smooth = True
    return ob

def timber(V, F, lo, hi, ch=0.02, lean=0.0):
    """a chamfered box from lo to hi (its top leaning a little in x: no two posts quite plumb)"""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for q in bm.verts: q.co = Vector([lo[k] + (q.co[k] + 0.5) * (hi[k] - lo[k]) for k in range(3)])
    # (the chamfer in metres, after the box has its size: the same small bevel on every edge)
    bmesh.ops.bevel(bm, geom=list(bm.edges) + list(bm.verts), offset=ch, segments=1, affect='EDGES', profile=0.5)
    for q in bm.verts: q.co.x += lean * (q.co.z - lo[2]) / (hi[2] - lo[2])
    o = len(V); V += [q.co.copy() for q in bm.verts]; F += [tuple(o + q.index for q in f.verts) for f in bm.faces]; bm.free()

def ribbon(V, F, pts, lifts, width, face_y, normal_y=-1.0):
    """a raised ribbon laid on a flat face (y = face_y, facing -y): its path pts [(x, z)], its height off the face at each
    point (lifts), its width — the top, both walls and the two ends"""
    n = len(pts)
    for i, (x, z) in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(n - 1, i + 1)]
        tx, tz = b[0] - a[0], b[1] - a[1]; l = math.hypot(tx, tz) or 1; nx, nz = tz / l, -tx / l
        w = width / 2; lift = lifts[i]
        L0 = Vector((x - nx * w, face_y + 0.004, z - nz * w)); R0 = Vector((x + nx * w, face_y + 0.004, z + nz * w))
        L1 = Vector((x - nx * w * 0.86, face_y - lift, z - nz * w * 0.86)); R1 = Vector((x + nx * w * 0.86, face_y - lift, z + nz * w * 0.86))
        o = len(V); V += [L0, L1, R1, R0]
        if i:
            q = o - 4
            F += [(q + 1, q + 2, o + 2, o + 1), (q, q + 1, o + 1, o), (q + 2, q + 3, o + 3, o + 2)]
    s = len(V) - 4 * n
    F += [(s, s + 3, s + 2, s + 1), (len(V) - 4, len(V) - 3, len(V) - 2, len(V) - 1)]

def plait(V, F, a0, a1, c, amp, period, width, face_y, samples, along_x=False):
    """two ribbons waving about the line c, crossing every half period, the one over the other in turn (over and under)"""
    for sgn in (1, -1):
        pts, lifts = [], []
        for k in range(samples + 1):
            t = a0 + (a1 - a0) * k / samples
            off = sgn * amp * math.sin(2 * math.pi * (t - a0) / period)
            # (at each crossing one ribbon rides high and the other dips: over at one, under at the next)
            ride = sgn * math.cos(2 * math.pi * (t - a0) / period)
            lift = 0.013 + 0.006 * ride
            pts.append((t, c + off) if along_x else (c + off, t)); lifts.append(lift)
        ribbon(V, F, pts, lifts, width, face_y)

def build():
    wood = mat('madeira', (0.24, 0.16, 0.1)); carve = mat('entalhe', (0.5, 0.2, 0.13))
    V, F = [], []
    timber(V, F, (-0.74, -0.09, 0.08), (-0.5, 0.09, 2.02), lean=-0.006)     # (the left post)
    timber(V, F, (0.5, -0.09, 0.08), (0.74, 0.09, 2.02), lean=0.005)        # (the right post)
    timber(V, F, (-0.88, -0.1, 2.0), (0.88, 0.1, 2.3), ch=0.025)              # (the lintel, heavier)
    timber(V, F, (-0.72, -0.13, -0.06), (0.72, 0.11, 0.12), ch=0.03)          # (the threshold, half in the ground)
    link('madeira', V, F, wood)
    C, CF = [], []
    for xc in (-0.62, 0.62):
        plait(C, CF, 0.24, 1.86, xc, 0.05, 0.54, 0.044, -0.09, 20)
    plait(C, CF, -0.66, 0.66, 2.15, 0.058, 0.44, 0.044, -0.1, 24, along_x=True)
    # (where the lintel runs past the posts, a scroll at each end, curling in toward the door)
    for e in (-1, 1):
        pts = []; lifts = []
        for k in range(15):
            a = math.pi * 0.5 + k * 0.62; r = 0.105 - k * 0.0062
            pts.append((e * (0.785 + r * math.cos(a) * 0.62), 2.15 + r * math.sin(a) * 0.95)); lifts.append(0.014)
        ribbon(C, CF, pts, lifts, 0.04, -0.1)
    link('entalhe', C, CF, carve)

build()
