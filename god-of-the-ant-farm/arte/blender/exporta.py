# exporta: a shape made in Blender, written as a data file the game reads without fetching anything (it opens from
# file://): js/mesh-<nome>.js, G.MESH3D.<nome>, decoded by js/mesh3d.js (G.Mesh3D.geo / part).
#   VENV/bin/python arte/blender/exporta.py FONTE NOME [--obj a,b] [--tris N] [--angulo 40] [--saida js/mesh-NOME.js]
# FONTE: a .blend, or a .py that builds the scene (run in an empty scene — see arte/blender/dragao.py). Every visible mesh
# object is taken (or only --obj ones), its modifiers applied, its transform baked in, triangulated.
# The game's frame: metres, Y up, the front toward +Z — Blender's (x, y, z) becomes (x, z, -y), so a model that looks
# toward Blender's -Y (its "Front" view) looks toward the game's +Z. Each material slot becomes a part (its name), so a
# builder can paint each part its own colour and pattern. Normals: smooth, split where faces meet sharper than --angulo
# (or along edges marked sharp). UV: as the texture stack reads it — v grows down the picture (Blender's v flipped).
import sys, os, json, base64, math, runpy
import numpy as np
import bpy, bmesh

def args():
    a = sys.argv[1:]
    if '--' in a: a = a[a.index('--') + 1:]
    if len(a) < 2: raise SystemExit(__doc__ if __doc__ else 'uso: exporta.py FONTE NOME [--obj a,b] [--tris N] [--angulo 40] [--saida arquivo]')
    o = {'src': a[0], 'name': a[1], 'obj': None, 'tris': 0, 'angle': 40.0, 'out': None}
    k = 2
    while k < len(a):
        if a[k] == '--obj': o['obj'] = a[k + 1].split(','); k += 2
        elif a[k] == '--tris': o['tris'] = int(a[k + 1]); k += 2
        elif a[k] == '--angulo': o['angle'] = float(a[k + 1]); k += 2
        elif a[k] == '--saida': o['out'] = a[k + 1]; k += 2
        else: raise SystemExit('opção desconhecida: ' + a[k])
    return o

def load(src):
    if src.endswith('.blend'): bpy.ops.wm.open_mainfile(filepath=os.path.abspath(src)); return
    bpy.ops.wm.read_factory_settings(use_empty=True)
    runpy.run_path(os.path.abspath(src), run_name='__modelo__')

def sharpen(me, angle):
    """smooth faces, the edges sharper than the angle marked sharp (the game's light then breaks there, as on a carving);
    edges already marked sharp stay sharp"""
    bm = bmesh.new(); bm.from_mesh(me)
    lim = math.radians(angle)
    for f in bm.faces: f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2 and e.calc_face_angle(0.0) > lim: e.smooth = False
    bm.to_mesh(me); bm.free()

def gather(o):
    """the mesh objects, each with its modifiers applied into a mesh of its own (and thinned to the budget)"""
    obs = [ob for ob in bpy.context.scene.objects if ob.type == 'MESH' and (o['obj'] is None or ob.name in o['obj']) and ob.visible_get()]
    if not obs: raise SystemExit('nenhum objeto de malha na cena' + (f' com os nomes {o["obj"]}' if o['obj'] else ''))
    dg = bpy.context.evaluated_depsgraph_get()
    if o['tris']:
        # (a triangle budget: the big pieces thinned in proportion, the small ones — eyes, nails — kept whole)
        cnt = {}
        for ob in obs: em = ob.evaluated_get(dg).to_mesh(); em.calc_loop_triangles(); cnt[ob.name] = len(em.loop_triangles); ob.evaluated_get(dg).to_mesh_clear()
        tot = sum(cnt.values()); small = {k for k, v in cnt.items() if v < tot * 0.1}; keep = sum(cnt[k] for k in small)
        if tot > o['tris']:
            ratio = max(0.02, (o['tris'] - keep) / max(1, tot - keep))
            for ob in obs:
                if ob.name not in small: d = ob.modifiers.new('budget', 'DECIMATE'); d.ratio = ratio
            dg = bpy.context.evaluated_depsgraph_get()
    out = []
    for ob in obs:
        me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg), preserve_all_data_layers=True, depsgraph=dg)
        out.append((ob.name, me, ob.matrix_world.copy()))
    return out

def bake(meshes):
    P, N, UV, C, parts = [], [], [], [], {}
    any_uv = False; any_col = False
    keys = {}
    for oname, em, mw in meshes:
        em.transform(mw); flip = mw.determinant() < 0
        em.update(); em.calc_loop_triangles()
        uvl = em.uv_layers.active
        ca = em.color_attributes.active_color if len(em.color_attributes) else None
        mats = [m.name if m else f'parte{k}' for k, m in enumerate(em.materials)] or ['corpo']
        cn = em.corner_normals
        for t in em.loop_triangles:
            part = mats[min(t.material_index, len(mats) - 1)]
            tri = []
            for vi, li in zip(t.vertices, t.loops):
                p = em.vertices[vi].co; n = cn[li].vector
                # (Blender's x, y, z → the game's x, z, -y)
                pos = (p.x, p.z, -p.y); nor = (n.x, n.z, -n.y)
                ln = math.sqrt(nor[0] ** 2 + nor[1] ** 2 + nor[2] ** 2) or 1.0
                qn = tuple(int(round(c / ln * 127)) for c in nor)
                uv = None; col = None
                if uvl is not None:
                    d = uvl.uv[li].vector if hasattr(uvl, 'uv') else uvl.data[li].uv
                    uv = (round(d[0], 5), round(1.0 - d[1], 5)); any_uv = True
                if ca is not None:
                    cd = ca.data[li if ca.domain == 'CORNER' else vi]
                    c4 = cd.color_srgb if hasattr(cd, 'color_srgb') else cd.color
                    col = tuple(int(round(max(0, min(1, c4[k])) * 255)) for k in range(3)); any_col = True
                key = (oname, vi, qn, uv, col)
                j = keys.get(key)
                if j is None:
                    j = len(P); keys[key] = j; P.append(pos); N.append(qn); UV.append(uv or (0.0, 0.0)); C.append(col or (255, 255, 255))
                tri.append(j)
            if flip: tri = [tri[0], tri[2], tri[1]]
            parts.setdefault(part, []).append(tri)
    # (the triangles grouped by part, so each part is one run of the index)
    order = []; idx = []
    for name, tris in parts.items():
        order.append([name, len(idx), len(tris) * 3]); [idx.extend(t) for t in tris]
    return np.array(P, '<f4'), np.array(N, '<i1'), np.array(UV, '<f4') if any_uv else None, np.array(C, 'u1') if any_col else None, np.array(idx), order

def write(o, P, N, UV, C, idx, parts):
    b64 = lambda a: base64.b64encode(a.tobytes()).decode()
    big = len(P) > 65535
    lo = P.min(0); hi = P.max(0)
    d = {'v': 1, 'n': int(len(P)), 't': int(len(idx) // 3), 'box': [round(float(q), 4) for q in list(lo) + list(hi)],
         'pos': b64(P), 'nor': b64(N), 'idx': b64(idx.astype('<u4' if big else '<u2')), 'i32': bool(big), 'parts': parts}
    if UV is not None: d['uv'] = b64(UV)
    if C is not None: d['col'] = b64(C)
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    out = o['out'] or os.path.join(root, 'js', f"mesh-{o['name']}.js")
    src = os.path.relpath(os.path.abspath(o['src']), root)
    body = json.dumps(d, separators=(',', ':'))
    js = ["'use strict';", f"// mesh-{o['name']}: made in Blender ({src}) and written by arte/blender/exporta.py — do not edit by hand (export it again).",
          f"// {d['n']} points, {d['t']} triangles, parts {', '.join(p[0] for p in parts)}; metres, Y up, the front toward +Z; read by js/mesh3d.js",
          '(function (G) {', f"  (G.MESH3D = G.MESH3D || {{}})[{json.dumps(o['name'])}] = {body};", '})(window.G);', '']
    with open(out, 'w') as f: f.write('\n'.join(js))
    size = os.path.getsize(out)
    print(f"{o['name']}: {d['n']} pontos, {d['t']} triângulos, partes {[(p[0], p[2] // 3) for p in parts]}, caixa {d['box']}, {size / 1024:.1f} KB → {os.path.relpath(out, root)}")

def main():
    o = args(); load(o['src'])
    meshes = gather(o)
    for _, me, _ in meshes: sharpen(me, o['angle'])
    write(o, *bake(meshes))

if __name__ == '__main__':
    main()
