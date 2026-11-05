# dragao: the carved dragon head at the end of a northern longhouse's ridge (the god's view draws one at each end) —
# a neck that rises from the ridge and bends forward, the skull, a snout curling up at its tip, the jaw open, a tongue,
# horns swept back, a crest down the nape, the eyes a part of their own (they are painted). Built from a skeleton with
# Blender's Skin modifier and smoothed by a subdivision, as a carver roughs it out of one piece of wood.
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/dragao.py dragao --tris 900
# Its frame: metres, the foot (where it meets the ridge beam) at the origin, looking toward Blender's -Y (the game's +Z).
import bpy

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def skin_object(name, pts, edges, roots=(0,), material=None):
    """a skeleton dressed by the Skin modifier (each separate piece needs its own root) and smoothed"""
    me = bpy.data.meshes.new(name); ob = bpy.data.objects.new(name, me); bpy.context.scene.collection.objects.link(ob)
    me.from_pydata([p[:3] for p in pts], edges, [])
    sk = ob.modifiers.new('pele', 'SKIN'); sk.use_smooth_shade = True; sk.branch_smoothing = 0.6
    for k, v in enumerate(me.skin_vertices[0].data):
        r = pts[k][3]; v.radius = (r, r * (pts[k][4] if len(pts[k]) > 4 else 1.0)); v.use_root = k in roots
    sub = ob.modifiers.new('liso', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
    if material: me.materials.append(material)
    return ob

def build():
    wood = mat('madeira', (0.23, 0.15, 0.09))
    P = []; E = []
    def add(x, y, z, r, sq=1.0, to=None):
        P.append((x, y, z, r, sq)); k = len(P) - 1
        if to is not None: E.append((to, k))
        return k
    # the spine: from the ridge up the neck in an S, over the skull to the snout, the tip rolled up in a spiral
    s = add(0, 0.12, 0.00, 0.10)
    s = add(0, 0.10, 0.20, 0.092, 1.0, s)
    s2 = s = add(0, 0.03, 0.41, 0.086, 1.0, s)
    s3 = s = add(0, -0.05, 0.59, 0.084, 1.0, s)
    s4 = s = add(0, -0.14, 0.75, 0.088, 1.0, s)
    skull = s = add(0, -0.28, 0.86, 0.118, 0.9, s)
    brow = s = add(0, -0.42, 0.89, 0.096, 0.85, s)
    snout = s = add(0, -0.56, 0.875, 0.072, 0.8, s)
    s = add(0, -0.67, 0.865, 0.058, 0.85, s)
    s = add(0, -0.745, 0.89, 0.046, 1.0, s)
    s = add(0, -0.765, 0.945, 0.036, 1.0, s)
    s = add(0, -0.73, 0.985, 0.027, 1.0, s)
    s = add(0, -0.69, 0.96, 0.019, 1.0, s)
    # the lower jaw, open, its tip curling up; a spike of beard under the chin
    j = add(0, -0.41, 0.775, 0.068, 0.75, skull)
    j2 = j = add(0, -0.55, 0.745, 0.05, 0.75, j)
    j = add(0, -0.65, 0.745, 0.036, 0.9, j)
    j = add(0, -0.695, 0.775, 0.024, 1.0, j)
    add(0, -0.36, 0.67, 0.02, 1.0, j2 - 1)
    # the tongue, out of the mouth and curling
    t = add(0, -0.47, 0.815, 0.022, 0.6, j2 - 1)
    t = add(0, -0.62, 0.81, 0.017, 0.6, t)
    t = add(0, -0.76, 0.79, 0.013, 0.7, t)
    t = add(0, -0.82, 0.83, 0.009, 1.0, t)
    # the horns, swept back from the skull, and the ridges over the eyes
    for sx in (-1, 1):
        h = add(sx * 0.07, -0.24, 0.98, 0.034, 1.0, skull)
        h = add(sx * 0.1, -0.13, 1.06, 0.024, 1.0, h)
        h = add(sx * 0.1, -0.02, 1.09, 0.014, 1.0, h)
        add(sx * 0.062, -0.45, 0.96, 0.03, 0.8, brow)
    # the fangs
    for sx in (-1, 1):
        add(sx * 0.035, -0.62, 0.81, 0.011, 1.0, snout + 1)
        add(sx * 0.03, -0.55, 0.795, 0.01, 1.0, j2)
    skin_object('dragao', P, E, (0,), wood)
    # the crest down the nape: spines of their own, their feet sunk in the neck (a branch of the neck's own skeleton
    # would ring it like a stalk of bamboo)
    C = []; CE = []
    for (x0, y0, z0, x1, y1, z1, r) in [(0, 0.08, 0.24, 0, 0.27, 0.33, 0.04), (0, 0.04, 0.42, 0, 0.23, 0.53, 0.042), (0, -0.03, 0.6, 0, 0.15, 0.73, 0.042), (0, -0.12, 0.76, 0, 0.03, 0.92, 0.04), (0, -0.25, 0.9, 0, -0.16, 1.06, 0.038)]:
        a = len(C); C += [(x0, y0, z0, r, 0.42), ((x0 + x1) / 2, (y0 + y1) / 2 + 0.02, (z0 + z1) / 2 - 0.01, r * 0.62, 0.42), (x1, y1, z1, r * 0.18, 0.6)]; CE += [(a, a + 1), (a + 1, a + 2)]
    skin_object('crista', C, CE, tuple(range(0, len(C), 3)), wood)
    # the eyes (painted): two small domes on the sides of the brow
    eye = mat('olho', (0.85, 0.7, 0.25))
    for sx in (-1, 1):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=8, ring_count=4, radius=0.034, location=(sx * 0.074, -0.445, 0.915))
        ob = bpy.context.active_object; ob.name = f'olho{"E" if sx < 0 else "D"}'; ob.scale = (0.75, 1.0, 0.8); ob.data.materials.append(eye)

build()
