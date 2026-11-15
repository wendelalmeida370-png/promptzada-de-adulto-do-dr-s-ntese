# empena: the carved ends of the barge boards past a gable's peak, as the north carves them out of the board itself — the
# two that go with the dragon head (dragao.py): a horse's head on its neck (the farmhouse's), and a scroll that curls in
# (the plainest). Cut from a plank 7 cm thick, every edge eased; the horse's eye bored through. One file, three parts:
# cavalo (the horse), olho (its eye), voluta (the scroll) — a builder puts the one it wants, each at the same foot.
# Photo: VENV/bin/python arte/blender/foto.py arte/blender/empena.py SAIDA.png
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/empena.py empena --angulo 35
# Its frame: metres, the foot (where the carving leaves the board's end) at the origin, the board's plane upright, the
# carving reaching forward toward Blender's -Y (the game's +Z: turn it to the board's 'out', away from the ridge); the
# plank's thickness across X. (For a scroll on the other side of the gable, the builder mirrors it: s = -1 in x.)
import math
import bpy, bmesh
from mathutils import Vector

T = 0.07   # (the plank's thickness)

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def board(name, outline, material, ease=0.007):
    """a silhouette (u forward, v up) cut out of a plank: the face, pushed through T, its edges eased"""
    bm = bmesh.new()
    vs = [bm.verts.new((-T / 2, -u, v)) for (u, v) in outline]
    f = bm.faces.new(vs)
    if f.normal.x > 0: f.normal_flip()
    r = bmesh.ops.extrude_face_region(bm, geom=[f], use_keep_orig=True)   # (the first face stays: the plank's back)
    moved = [e for e in r['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, verts=moved, vec=(T, 0, 0))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    rim = [e for e in bm.edges if abs(e.verts[0].co.x - e.verts[1].co.x) < 1e-6]   # (the outline of both faces)
    bmesh.ops.bevel(bm, geom=rim + list({v for e in rim for v in e.verts}), offset=ease, segments=1, affect='EDGES', clamp_overlap=True, profile=0.5)
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob); me.materials.append(material)
    return ob

def horse():
    # (the back of the neck from the board up, the mane in four tufts, the ears, the brow, the long face, the muzzle,
    # the jaw, the throat, and down the front of the neck to the board again)
    back = [(-0.06, 0.0), (-0.072, 0.12), (-0.07, 0.24)]
    mane = []
    for k, (u, v) in enumerate([(-0.062, 0.31), (-0.042, 0.39), (-0.016, 0.46), (0.014, 0.52)]):
        mane += [(u - 0.022, v - 0.025 + 0.004 * k), (u, v)]                    # (a tuft out, back in)
    head = [(0.03, 0.58), (0.05, 0.68), (0.07, 0.605), (0.088, 0.645), (0.105, 0.595),   # (the ears)
            (0.16, 0.575), (0.24, 0.53), (0.32, 0.47), (0.385, 0.425), (0.42, 0.39),  # (brow, face, nose)
            (0.425, 0.355), (0.4, 0.335), (0.37, 0.34), (0.345, 0.315),              # (the lip, the mouth, the chin)
            (0.27, 0.31), (0.2, 0.3), (0.15, 0.27), (0.11, 0.2),                     # (the jaw, the cheek, the throat)
            (0.085, 0.12), (0.07, 0.04), (0.065, 0.0)]                               # (the front of the neck)
    return back + mane + head

def scroll():
    """the scroll as a band: the board running on, then curling up and in, narrowing as it goes"""
    C = (0.15, 0.2); pts = [(-0.02, 0.055), (0.06, 0.055)]
    n = 30
    for k in range(n + 1):
        t = k / n; a = -math.pi / 2 + t * 2.75 * math.pi; r = 0.145 * (1 - t) + 0.03 * t
        pts.append((C[0] + r * math.cos(a), C[1] + r * math.sin(a)))
    W = [0.075] * 2 + [0.075 * (1 - t) + 0.034 * t for t in [k / n for k in range(n + 1)]]
    L, R = [], []
    for i, (u, v) in enumerate(pts):
        a = pts[max(0, i - 1)]; b = pts[min(len(pts) - 1, i + 1)]
        tu, tv = b[0] - a[0], b[1] - a[1]; l = math.hypot(tu, tv) or 1; nu, nv = -tv / l, tu / l
        L.append((u + nu * W[i] / 2, v + nv * W[i] / 2)); R.append((u - nu * W[i] / 2, v - nv * W[i] / 2))
    return L + R[::-1]

def build():
    wood = mat('cavalo', (0.26, 0.17, 0.1)); eye = mat('olho', (0.08, 0.06, 0.05)); sc = mat('voluta', (0.26, 0.17, 0.1))
    board('cavalo', horse(), wood)
    board('voluta', scroll(), sc)
    # (the eye bored through the head: a short peg, a little proud of both faces)
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.017, depth=T + 0.008, location=(0, -0.23, 0.5), rotation=(0, math.pi / 2, 0))
    ob = bpy.context.active_object; ob.name = 'olho'; ob.data.materials.append(eye)
    while ob.data.uv_layers: ob.data.uv_layers.remove(ob.data.uv_layers[0])   # (no picture is laid on it: no uv to carry)

build()
