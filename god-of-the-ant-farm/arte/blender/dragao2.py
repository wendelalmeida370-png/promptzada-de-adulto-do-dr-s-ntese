# dragao2: the other carved dragon of a ridge end — so two rich houses side by side are not the same (BIBLIA §5): a
# serpent's head on a longer neck in a deeper S, the snout long and lean with the lips drawn back, no horns but two
# swept frills behind the jaw, the crest one continuous fin down the nape in scallops, a ring held in the jaws (the
# carvers' "gripping beast"), the eyes a part of their own (they are painted). Built as dragao.py: a skeleton dressed
# by Blender's Skin modifier and smoothed by a subdivision.
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/dragao2.py dragao2 --tris 900 --angulo 60
# Its frame: as dragao.py — metres, the foot (where it meets the ridge beam) at the origin, looking toward Blender's -Y
# (the game's +Z).
import math
import bpy

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def skin_object(name, pts, edges, roots=(0,), material=None, levels=2):
    me = bpy.data.meshes.new(name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    me.from_pydata([p[:3] for p in pts], edges, [])
    sk = ob.modifiers.new('pele', 'SKIN'); sk.use_smooth_shade = True; sk.branch_smoothing = 0.6
    for k, v in enumerate(me.skin_vertices[0].data):
        r = pts[k][3]; v.radius = (r, r * (pts[k][4] if len(pts[k]) > 4 else 1.0)); v.use_root = k in roots
    sub = ob.modifiers.new('liso', 'SUBSURF'); sub.levels = levels; sub.render_levels = levels
    if material: me.materials.append(material)
    return ob

def build():
    wood = mat('madeira', (0.23, 0.15, 0.09))
    P = []; E = []
    def add(x, y, z, r, sq=1.0, to=None):
        P.append((x, y, z, r, sq)); k = len(P) - 1
        if to is not None: E.append((to, k))
        return k
    # the neck in a deep S: back over the ridge first, then up and forward, the head held out level
    s = add(0, 0.1, 0.0, 0.095)
    s = add(0, 0.16, 0.18, 0.085, 1.0, s)
    s = add(0, 0.12, 0.38, 0.078, 1.0, s)
    s = add(0, 0.0, 0.54, 0.074, 1.0, s)
    s = add(0, -0.14, 0.66, 0.076, 1.0, s)
    skull = s = add(0, -0.27, 0.74, 0.1, 0.85, s)
    brow = s = add(0, -0.4, 0.765, 0.078, 0.8, s)
    s = add(0, -0.53, 0.76, 0.06, 0.75, s)
    snout = s = add(0, -0.66, 0.75, 0.048, 0.8, s)
    s = add(0, -0.76, 0.75, 0.038, 0.9, s)
    s = add(0, -0.82, 0.765, 0.028, 1.0, s)                       # (the tip of the upper jaw, a little upturned)
    # the lower jaw, lean and long, a little open
    j = add(0, -0.39, 0.68, 0.055, 0.7, skull)
    j2 = j = add(0, -0.55, 0.665, 0.042, 0.75, j)
    j = add(0, -0.7, 0.675, 0.03, 0.85, j)
    j = add(0, -0.78, 0.69, 0.022, 1.0, j)
    # the frills behind the jaw, swept back and up
    for sx in (-1, 1):
        f = add(sx * 0.06, -0.25, 0.72, 0.03, 0.5, skull)
        f = add(sx * 0.1, -0.15, 0.79, 0.022, 0.45, f)
        add(sx * 0.12, -0.05, 0.86, 0.012, 0.5, f)
    # the brow ridges over the eyes, and the fangs at the lips
    for sx in (-1, 1):
        add(sx * 0.05, -0.42, 0.82, 0.024, 0.8, brow)
        add(sx * 0.028, -0.7, 0.72, 0.009, 1.0, snout)
    skin_object('dragao2', P, E, (0,), wood)
    # the crest: one fin down the nape in scallops, each a blade of its own with its foot sunk in the neck
    C = []; CE = []
    pts = [(0.17, 0.1), (0.155, 0.27), (0.1, 0.44), (0.02, 0.58), (-0.08, 0.68), (-0.19, 0.78)]
    for (y0, z0) in pts:
        a = len(C); C += [(0, y0, z0, 0.04, 0.35), (0, y0 + 0.07, z0 + 0.07, 0.022, 0.4), (0, y0 + 0.1, z0 + 0.1, 0.006, 0.6)]
        CE += [(a, a + 1), (a + 1, a + 2)]
    skin_object('crista2', C, CE, tuple(range(0, len(C), 3)), wood)
    # the ring held in the jaws (the gripping beast): a torus through the mouth
    bpy.ops.mesh.primitive_torus_add(major_radius=0.075, minor_radius=0.02, major_segments=14, minor_segments=6, location=(0, -0.7, 0.67), rotation=(math.pi / 2, 0, 0))
    ring = bpy.context.active_object; ring.name = 'argola'; ring.data.materials.append(wood)
    while ring.data.uv_layers: ring.data.uv_layers.remove(ring.data.uv_layers[0])
    # the eyes (painted): two small domes on the sides of the brow
    eye = mat('olho', (0.85, 0.7, 0.25))
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.03, location=(sx * 0.062, -0.42, 0.79))
        ob = bpy.context.active_object; ob.name = f'olho{"E" if sx < 0 else "D"}'; ob.scale = (0.75, 1.0, 0.8); ob.data.materials.append(eye)
        while ob.data.uv_layers: ob.data.uv_layers.remove(ob.data.uv_layers[0])

build()
