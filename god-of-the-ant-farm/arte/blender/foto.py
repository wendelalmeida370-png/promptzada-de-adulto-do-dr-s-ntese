# foto: a quick picture of a model before it goes into the game — four views (front, side, three-quarter, above) of a
# .blend or a modelling .py, rendered by Cycles on the processor (no graphics card needed), with a 1.75 m stick beside it
# for scale. Nothing here goes into the game.
#   VENV/bin/python arte/blender/foto.py FONTE SAIDA.png [lado em px]
import sys, os, math, runpy
import bpy
from mathutils import Vector

def main():
    a = sys.argv[1:]; src, out = a[0], a[1]; px = int(a[2]) if len(a) > 2 else 360
    if src.endswith('.blend'): bpy.ops.wm.open_mainfile(filepath=os.path.abspath(src))
    else: bpy.ops.wm.read_factory_settings(use_empty=True); runpy.run_path(os.path.abspath(src), run_name='__modelo__')
    sc = bpy.context.scene
    obs = [o for o in sc.objects if o.type == 'MESH']
    dg = bpy.context.evaluated_depsgraph_get()
    lo = Vector((1e9,) * 3); hi = Vector((-1e9,) * 3)
    for o in obs:
        for c in o.evaluated_get(dg).bound_box:
            w = o.matrix_world @ Vector(c); lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
    mid = (lo + hi) / 2; size = max((hi - lo).length, 0.3)
    # (the person for scale: a thin post 1.75 m, beside the model)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.012, depth=1.75, location=(lo.x - 0.25, mid.y, lo.z + 0.875))
    m = bpy.data.materials.new('escala'); m.diffuse_color = (0.9, 0.2, 0.2, 1); bpy.context.active_object.data.materials.append(m)
    for o in obs:
        for s in o.material_slots:
            if s.material and not s.material.use_nodes: s.material.use_nodes = True
            if s.material:
                b = s.material.node_tree.nodes.get('Principled BSDF')
                if b: b.inputs['Base Color'].default_value = s.material.diffuse_color; b.inputs['Roughness'].default_value = 0.7
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.62, 0.7, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.6
    sun = bpy.data.lights.new('sol', 'SUN'); sun.energy = 3.5; so = bpy.data.objects.new('sol', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(35))
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = size * 1.25; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 24; sc.cycles.device = 'CPU'; sc.render.resolution_x = sc.render.resolution_y = px; sc.render.film_transparent = False
    sc.view_settings.view_transform = 'Standard'
    views = [('frente', (0, -1, 0)), ('lado', (1, 0, 0)), ('tres-quartos', (0.8, -0.8, 0.45)), ('cima', (0.0001, -0.0001, 1))]
    files = []
    for name, d in views:
        d = Vector(d).normalized(); co.location = mid + d * size * 3
        co.rotation_euler = (mid - co.location).to_track_quat('-Z', 'Y').to_euler()
        f = out.replace('.png', f'-{name}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True); files.append(f)
    # (the four side by side)
    try:
        from PIL import Image
        ims = [Image.open(f) for f in files]; sheet = Image.new('RGB', (px * 4, px))
        for k, im in enumerate(ims): sheet.paste(im.convert('RGB'), (k * px, 0))
        sheet.save(out); [os.remove(f) for f in files]
    except ImportError: pass
    print('ok', out)

main()
