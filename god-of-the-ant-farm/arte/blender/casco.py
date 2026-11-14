# casco: a ship's hull in the unit frame js/fx3d.js draws its ships in — one long (x from -0.5, the stern, to +0.5, the
# bow), one wide (z from -0.5 to 0.5), about one high, the keel on the frame's floor — so it takes the place of the
# faceted box hull with nothing else changed (the fx3d scales it to each kind: length, beam, 1.25 high). A double-ended
# hull built clinker-fashion, as the north builds them: five strakes a side, each one's lower edge lapping outside the
# one below (a line of light and a line of shade along the side), the gunwale rising toward both ends, the keel rocking
# up at them, and the stem and stern posts carried up past the gunwale into a curl; the inside floored a little under
# the gunwale. One part, casco (the fx3d paints each ship its wood's colour).
# Photo: VENV/bin/python arte/blender/foto.py arte/blender/casco.py SAIDA.png
# Export: VENV/bin/python arte/blender/exporta.py arte/blender/casco.py casco --angulo 35
# NOTE its frame is the fx3d's, not the usual one: the bow toward Blender's +X (the game's +X), the beam across Y.
import math
import bpy

NS = 18; NK = 5; LIP = 0.012

def mat(name, rgb):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.diffuse_color = (*rgb, 1.0); return m

def half_beam(x): t = min(1.0, abs(x) / 0.5); return 0.5 * max(0.0, 1 - t ** 2.2) ** 0.55
def sheer(x): t = min(1.0, abs(x) / 0.5); return 0.86 + 0.5 * t ** 3.5          # (the ends sweep up)
def keel(x): t = min(1.0, abs(x) / 0.5); return 0.1 * t ** 2.5 + 0.45 * t ** 10   # (the keel rocks up, then curves into the stem)

def section(x, side):
    """the half-section at x, from the keel to the gunwale: a rounded bilge (a superellipse quarter), cut in strakes —
    two points to a strake: its lower edge (pushed out over the strake below) and its upper edge"""
    w = half_beam(x); zg = sheer(x); zk = keel(x); p = 2.6; out = []
    for k in range(NK):
        for e, push in ((k / NK, LIP), ((k + 1) / NK - 0.002, 0.0)):
            th = e * math.pi / 2; c, s = math.cos(th), math.sin(th)
            y = w * s ** (2 / p); z = zk + (zg - zk) * (1 - c ** (2 / p))
            # (the lap: out along the section's normal, less where the hull closes in at the ends)
            ny, nz = c ** 0.8, s ** 0.3 * 0.25
            l = math.hypot(ny, nz) or 1
            f = push * min(1.0, w / 0.12)
            out.append((x, side * (y + ny / l * f), z - nz / l * f * 0.3))
    return out

def build():
    V, F = [], []
    xs = [-0.5 + k / NS for k in range(NS + 1)]
    rings = []
    for x in xs:
        port = section(x, 1); star = section(x, -1)
        ring = port[::-1] + [(x, 0.0, keel(x))] + star          # (gunwale to keel to gunwale)
        rings.append(ring)
    n = len(rings[0])
    for r in rings: V += r
    for i in range(len(rings) - 1):
        for j in range(n - 1):
            a = i * n + j; b = a + 1; c = a + n + 1; d = a + n
            F.append((a, d, c, b))
    # (the floor, a little under the gunwale, from one end of the hold to the other)
    fo = len(V)
    for x in xs[2:-2]:
        zf = sheer(x) - 0.17; w = half_beam(x) * 0.86
        V += [(x, w, zf), (x, -w, zf)]
    for i in range(len(xs) - 5):
        a = fo + i * 2; F.append((a, a + 1, a + 3, a + 2))
    # the stem and stern posts: past the gunwale and up into a curl, a square timber swept along the curve
    # (drawn in the metres of a merchant ship of the fx3d — 13 m long, 3.8 of beam, 1.25 high — and brought to the unit
    # frame, so the curl is round on the ships the world has most)
    RL, RB, RH = 13.0, 3.8, 1.25
    for sgn in (1, -1):
        m = [(6.5, 1.65), (6.62, 2.05), (6.66, 2.42), (6.52, 2.72), (6.24, 2.8), (6.02, 2.62), (6.08, 2.4), (6.3, 2.36)]
        pts = [(sgn * px / RL, pz / RH) for px, pz in m]
        o = len(V); hw = 0.1 / RB; hx = 0.07 / RL
        for (px, pz) in pts:
            V += [(px - hx, hw, pz), (px - hx, -hw, pz), (px + hx, -hw, pz), (px + hx, hw, pz)]
        for i in range(len(pts) - 1):
            for q in range(4):
                a = o + i * 4 + q; b = o + i * 4 + (q + 1) % 4
                F.append((a, b, b + 4, a + 4))
        F.append((o, o + 1, o + 2, o + 3)); e = o + (len(pts) - 1) * 4; F.append((e + 3, e + 2, e + 1, e))
    me = bpy.data.meshes.new('casco'); me.from_pydata(V, [], F); me.validate(); me.update()
    ob = bpy.data.objects.new('casco', me); bpy.context.scene.collection.objects.link(ob)
    me.materials.append(mat('casco', (0.3, 0.2, 0.12)))
    for p in me.polygons: p.use_smooth = True
    # (the faces outward: the hull is read from both sides, but the light needs them one way)
    import bmesh
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()

build()
