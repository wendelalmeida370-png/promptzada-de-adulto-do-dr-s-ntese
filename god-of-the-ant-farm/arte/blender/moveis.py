# moveis: the furniture of the interiors, modelled by code in Blender and written as one data file the game reads without
# fetching anything — js/movelmesh.js: each model a G.MESH3D entry 'movel-<peça>-<povo>-<largura>x<fundo>x<altura>' (in cm; and
# the same name with '@1' for its middle level of detail), in the format G.Mesh3D reads (arte/ESTUDIO.md §2, the BIBLIA §8),
# with what the game needs to fit it to the plan's piece (its kind, its people, its nominal size, its anchors) — and the table of
# which people use which model (G.MOVEIS.alias). The interiors 2.0, the front P2 (D-710 to D-719).
#   VENV/bin/python arte/blender/moveis.py                       → every model, the file written again
#   VENV/bin/python arte/blender/moveis.py banquinho [mesa ...]   → only those kinds' models (the others kept from the file)
#   VENV/bin/python arte/blender/moveis.py banquinho:grego        → only that people's model of the kind
#   VENV/bin/python arte/blender/moveis.py --prev SAIDA.png peça:povo   → four views of one model (nothing written)
#   VENV/bin/python arte/blender/moveis.py --folha PASTA [povo ...] [--lod 1]   → the sheet of every people's pieces (nothing written)
#   VENV/bin/python arte/blender/moveis.py --conta              → the triangles and the size of each model (nothing written)
#   VENV/bin/python arte/blender/moveis.py --confere            → every model built again beside the file (nothing written): the file is
#                                                                 what this script makes today (L-2260)
# The shapes: arte/blender/moveis_forma.py; the pieces of each people: arte/blender/moveis_pecas.py. Nothing is drawn by chance:
# the same script, the same file, byte for byte.
import sys, os, re, json, base64, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import moveis_forma as F
import moveis_tabela as PC

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'js', 'movelmesh.js')
CIVS = PC.CIVS

def srgb(x):
    x = max(0.0, min(1.0, x)); return 1.055 * x ** (1 / 2.4) - 0.055 if x > 0.0031308 else 12.92 * x

def build(spec, lod):
    """one model: its builder run at a level of detail, its light baked, its parts' points joined where they are the same"""
    M = F.Modelo(spec['nome'], lod); spec['fn'](M, spec['w'], spec['d'], spec['h'])
    F.bake_ao(M, rays=20 if lod == 0 else 12)
    return M

def encode(M, spec):
    P, N, UV, C, idx, parts = [], [], [], [], [], []
    for name in sorted(M.parts, key=lambda k: (PC.PART_ORDER.index(k) if k in PC.PART_ORDER else 99, k)):
        q = M.parts[name]
        if not q.T: continue
        keys = {}; start = len(idx); rem = {}
        for i, (p, n, uv, a) in enumerate(zip(q.P, q.N, q.UV, q.C)):
            qn = tuple(int(round(c * 127)) for c in n); ql = round(srgb(a) * 255)
            key = (round(p[0], 5), round(p[1], 5), round(p[2], 5), qn, round(uv[0], 4), round(uv[1], 4), ql)
            j = keys.get(key)
            if j is None:
                j = len(P); keys[key] = j; P.append(key[:3]); N.append(qn); UV.append((key[4], key[5])); C.append((ql, ql, ql))
            rem[i] = j
        for a, b, c in q.T:
            A, B, Cc = rem[a], rem[b], rem[c]
            if A == B or B == Cc or A == Cc: continue
            idx += [A, B, Cc]
        parts.append([name, start, len(idx) - start])
    P = np.array(P, '<f4'); N = np.array(N, '<i1'); UV = np.array(UV, '<f4'); C = np.array(C, 'u1'); I = np.array(idx)
    lo, hi = P.min(0), P.max(0); big = len(P) > 65535
    b64 = lambda a: base64.b64encode(a.tobytes()).decode()
    d = {'v': 1, 'n': int(len(P)), 't': int(len(I) // 3), 'box': [round(float(v), 4) for v in list(lo) + list(hi)],
         'pos': b64(P), 'nor': b64(N), 'idx': b64(I.astype('<u4' if big else '<u2')), 'i32': bool(big), 'parts': parts, 'uv': b64(UV), 'col': b64(C),
         'kind': spec['kind'], 'civ': spec['civ'], 'var': spec.get('var', ''), 'w': spec['w'], 'd': spec['d'], 'h': spec['h'], 'lod': M.lod, 'anc': M.anc}
    # (the piece keeps to its rectangle on the plan — the body bumps the rectangle, not the mesh —, and to its floor)
    tol = 0.004
    if lo[0] < -spec['w'] / 2 - tol or hi[0] > spec['w'] / 2 + tol or lo[2] < -spec['d'] / 2 - tol or hi[2] > spec['d'] / 2 + tol or lo[1] < -tol:
        raise SystemExit(f"{spec['nome']} (lod {M.lod}): fora do seu retângulo — caixa {d['box']}, retângulo {spec['w']} × {spec['d']}")
    return d

def line(name, d): return f"  M[{json.dumps(name)}] = {json.dumps(d, separators=(',', ':'))};"

def read_old():
    if not os.path.exists(OUT): return {}
    old = {}
    for l in open(OUT, encoding='utf8'):
        m = re.match(r'  M\["([^"]+)"\] = ', l)
        if m: old[m.group(1)] = l.rstrip('\n')
    return old

def text(lines, alias):
    n = len(lines); body = '\n'.join(lines[k] for k in sorted(lines))
    js = ["'use strict';",
          "// movelmesh: the furniture of the interiors (the interiors 2.0, the front P2, D-710) — made in Blender by arte/blender/moveis.py",
          "// (the shapes moveis_forma.py, the pieces moveis_pecas.py) and written by it: do not edit by hand, make it again. Each model a",
          "// G.MESH3D entry 'movel-<kind>-<people>-<w>x<d>x<h>' (cm; '@1' its middle level of detail), in the format G.Mesh3D reads:",
          "// metres, Y up, the front toward +Z, its foot at y = 0, centred on its rectangle; the parts by material; uv in metres (v along",
          "// the grain); the ambient light it gives itself in the vertex colours. Besides: its kind, its people, its nominal size (the",
          "// plan's piece it was made for), its level, its anchors (anc: where a thing may rest on it). G.MOVEIS.alias: the people that",
          f"// use another people's model of a kind. {n} models. Read by js/movel3d.js (G.Movel3D).",
          'window.G = window.G || {};',
          '(function (G) {',
          '  const M = G.MESH3D = G.MESH3D || {};',
          body,
          f"  G.MOVEIS = {json.dumps({'v': 1, 'alias': alias, 'parts': PC.PART_ORDER}, separators=(',', ':'))};",
          '})(window.G);', '']
    return '\n'.join(js)

def write(lines, alias):
    with open(OUT, 'w', encoding='utf8') as f: f.write(text(lines, alias))
    return os.path.getsize(OUT)

def confere():
    """every model built again and set beside the file, nothing written: the file is what this script makes today — no line of an
    older shape kept from a partial run after the shapes changed (L-2260)"""
    lines = {}
    for s in PC.specs():
        for lod in (0, 1): nm = s['nome'] + ('@1' if lod else ''); lines[nm] = line(nm, encode(build(s, lod), s))
    old = read_old(); bad = sorted(k for k in set(lines) | set(old) if lines.get(k) != old.get(k))
    same = os.path.exists(OUT) and open(OUT, encoding='utf8').read() == text(lines, PC.alias())
    for k in bad: print(f'  {k}: ' + ('só no arquivo' if k not in lines else 'falta no arquivo' if k not in old else 'outra forma'))
    print(f'movelmesh.js: {len(lines)} modelos feitos de novo, {len(bad)} diferentes' + ('' if same or bad else ' (o resto do arquivo difere)'))
    if bad or not same: raise SystemExit('FALHOU: o js/movelmesh.js não é o que o moveis.py faz hoje — rode VENV/bin/python arte/blender/moveis.py')
    print('PASSOU: o js/movelmesh.js é o que o moveis.py faz hoje')

def wanted(args):
    specs = PC.specs()
    if not args: return specs
    out = []
    for a in args:
        k, _, c = a.partition(':')
        sel = [s for s in specs if s['kind'] == k and (not c or s['civ'] == c or s.get('var') == c)]
        if not sel: raise SystemExit(f'nenhum modelo para {a} (peças: {sorted(set(s["kind"] for s in specs))})')
        out += sel
    return out

def export(args):
    specs = wanted(args); old = read_old() if args else {}
    names = {s['nome'] for s in PC.specs()}
    lines = {k: v for k, v in old.items() if k.split('@')[0] in names}
    rep = []
    for s in specs:
        for lod in (0, 1):
            M = build(s, lod); d = encode(M, s); nm = s['nome'] + ('@1' if lod else '')
            lines[nm] = line(nm, d); rep.append((nm, d['t'], len(lines[nm]) / 1024))
    size = write(lines, PC.alias())
    for nm, t, kb in rep: print(f'  {nm}: {t} triângulos, {kb:.1f} KB')
    print(f'movelmesh.js: {len(lines)} modelos, {size / 1024:.0f} KB')

def count():
    old = read_old(); tot = 0
    for k in sorted(old):
        m = re.search(r'"t":(\d+)', old[k]); tot += len(old[k]); print(f'{k}: {m.group(1) if m else "?"} triângulos, {len(old[k]) / 1024:.1f} KB')
    print(f'{len(old)} modelos, {tot / 1024:.0f} KB')

# ------------------------------ the pictures (Cycles, on the processor) ------------------------------
# (each people's colours as the game paints its pieces — js/movel3d.js V.WOOD, V.PAINT, V.CLAY and the palette's walls and stones,
# sRGB; the sheet shows the people as the game will)
CIV_COR = {
    'classico': {'madeira': (122, 88, 58), 'madeira2': (88, 62, 42), 'pintura': (128, 78, 52), 'reboco': (204, 190, 160), 'pedra': (160, 154, 142), 'barro': (176, 102, 66)},
    'romano': {'madeira': (130, 86, 54), 'madeira2': (84, 52, 34), 'pintura': (130, 52, 50), 'reboco': (196, 168, 124), 'pedra': (189, 180, 163), 'barro': (178, 96, 60)},
    'grego': {'madeira': (150, 116, 78), 'madeira2': (100, 74, 50), 'pintura': (72, 104, 150), 'reboco': (212, 206, 190), 'pedra': (231, 224, 205), 'barro': (186, 108, 66)},
    'egipcio': {'madeira': (172, 130, 86), 'madeira2': (64, 48, 36), 'pintura': (60, 128, 122), 'reboco': (196, 172, 128), 'pedra': (224, 207, 167), 'barro': (168, 112, 72)},
    'nordico': {'madeira': (112, 84, 58), 'madeira2': (72, 54, 38), 'pintura': (140, 62, 48), 'reboco': (110, 92, 70), 'pedra': (142, 135, 123), 'barro': (150, 96, 66)},
    'asteca': {'madeira': (138, 96, 62), 'madeira2': (94, 64, 42), 'pintura': (150, 62, 50), 'reboco': (208, 198, 172), 'pedra': (205, 193, 168), 'barro': (162, 86, 58)},
}
def lin(c): c = c / 255.0; return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def to_blender(M, at=(0, 0, 0), name='m', civ=None):
    """the model as Blender objects, one a part, each in the colour the game would paint it (its people's, CIV_COR; or PC.COR),
    its normals its own"""
    import bpy
    obs = []
    for pname, q in M.parts.items():
        if not q.T: continue
        V = [(p[0] + at[0], -(p[2] + at[2]), p[1] + at[1]) for p in q.P]
        me = bpy.data.meshes.new(f'{name}-{pname}'); me.from_pydata(V, [], [tuple(t) for t in q.T]); me.update()
        loops = []
        for t in q.T:
            for i in t: n = q.N[i]; loops.append((n[0], -n[2], n[1]))
        for p in me.polygons: p.use_smooth = True
        me.normals_split_custom_set(loops)
        col = me.color_attributes.new('ao', 'FLOAT_COLOR', 'CORNER')
        k = 0
        for t in q.T:
            for i in t: a = q.C[i]; col.data[k].color = (a, a, a, 1.0); k += 1
        mkey = 'mv-' + (civ or '') + '-' + pname; mat = bpy.data.materials.get(mkey)
        if mat is None:
            mat = bpy.data.materials.new(mkey); mat.use_nodes = True; nt = mat.node_tree
            bsdf = nt.nodes.get('Principled BSDF'); attr = nt.nodes.new('ShaderNodeAttribute'); attr.attribute_name = 'ao'
            mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.blend_type = 'MULTIPLY'; mix.inputs['Factor'].default_value = 1.0
            cc = CIV_COR.get(civ, {}).get(pname)
            rgb = tuple(lin(v) for v in cc) if cc else PC.COR.get(pname, (0.6, 0.5, 0.4)); mix.inputs[6].default_value = (*rgb, 1)
            nt.links.new(attr.outputs['Color'], mix.inputs[7]); nt.links.new(mix.outputs[2], bsdf.inputs['Base Color'])
            bsdf.inputs['Roughness'].default_value = PC.RUGO.get(pname, 0.75)
            if pname in ('ferro', 'bronze'): bsdf.inputs['Metallic'].default_value = 0.8
            if pname == 'brasa': bsdf.inputs['Emission Color'].default_value = (1.0, 0.3, 0.06, 1); bsdf.inputs['Emission Strength'].default_value = 0.7
        me.materials.append(mat)
        ob = bpy.data.objects.new(f'{name}-{pname}', me); bpy.context.scene.collection.objects.link(ob); obs.append(ob)
    return obs

def scene_setup(px_w, px_h, samples=24):
    import bpy
    sc = bpy.context.scene
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = (0.50, 0.47, 0.42, 1); bg.inputs['Strength'].default_value = 0.55
    sun = bpy.data.lights.new('sol', 'SUN'); sun.energy = 2.6; sun.angle = math.radians(12); so = bpy.data.objects.new('sol', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(48), 0, math.radians(-38))
    fill = bpy.data.lights.new('fogo', 'SUN'); fill.energy = 0.7; fill.color = (1.0, 0.72, 0.45); fo = bpy.data.objects.new('fogo', fill); sc.collection.objects.link(fo); fo.rotation_euler = (math.radians(70), 0, math.radians(140))
    sc.render.engine = 'CYCLES'; sc.cycles.samples = samples; sc.cycles.device = 'CPU'; sc.render.resolution_x = px_w; sc.render.resolution_y = px_h
    sc.view_settings.view_transform = 'Standard'
    sc.cycles.use_denoising = True
    return sc

def floor_plane(x0, x1, y0, y1):
    import bpy
    me = bpy.data.meshes.new('chao'); me.from_pydata([(x0, y0, 0), (x1, y0, 0), (x1, y1, 0), (x0, y1, 0)], [], [(0, 1, 2, 3)])
    m = bpy.data.materials.new('chao'); m.diffuse_color = (0.36, 0.30, 0.24, 1); m.use_nodes = True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.36, 0.30, 0.24, 1)
    me.materials.append(m); ob = bpy.data.objects.new('chao', me); bpy.context.scene.collection.objects.link(ob)

def label(text, x, y, z=0.002, size=0.12):
    import bpy
    cu = bpy.data.curves.new('t', 'FONT'); cu.body = text; cu.size = size; cu.align_x = 'CENTER'
    ob = bpy.data.objects.new('t', cu); ob.location = (x, y, z); bpy.context.scene.collection.objects.link(ob)
    m = bpy.data.materials.get('letra') or bpy.data.materials.new('letra'); m.use_nodes = True; m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = (0.92, 0.88, 0.78, 1)
    cu.materials.append(m)

def camera(sc, target, d, elev, azim, ortho):
    import bpy
    from mathutils import Vector
    cam = bpy.data.cameras.new('cam'); cam.type = 'ORTHO'; cam.ortho_scale = ortho; cam.sensor_fit = 'HORIZONTAL'; co = bpy.data.objects.new('cam', cam); sc.collection.objects.link(co); sc.camera = co
    e, a = math.radians(elev), math.radians(azim); dv = Vector((math.cos(e) * math.sin(a), -math.cos(e) * math.cos(a), math.sin(e)))
    co.location = Vector(target) + dv * d; co.rotation_euler = (Vector(target) - co.location).to_track_quat('-Z', 'Y').to_euler()
    return co

def prev(out, which):
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    s = wanted([which])[0]; M = build(s, 0)
    to_blender(M); sc = scene_setup(420, 420)
    floor_plane(-3, 3, -3, 3)
    top = max(p[1] for q in M.parts.values() for p in q.P)
    size = max(s['w'], s['d'], top) * 1.3
    views = [('frente', 8, 0), ('lado', 8, 90), ('tres', 30, 35), ('cima', 85, 0)]; files = []
    for nm, el, az in views:
        co = camera(sc, (0, 0, top * 0.48), 8, el, az, size)
        f = out.replace('.png', f'-{nm}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True); files.append(f)
        bpy.data.objects.remove(co)
    from PIL import Image
    ims = [Image.open(f).convert('RGB') for f in files]; sheet = Image.new('RGB', (420 * 4, 420))
    for k, im in enumerate(ims): sheet.paste(im, (k * 420, 0))
    sheet.save(out); [os.remove(f) for f in files]
    print(f"{s['nome']}: {M.ntri} triângulos → {out}")

def folha(pasta, civs, lod):
    """every people's pieces, one picture a people: each kind in the model the people use, in a row by size, its name under it"""
    import bpy
    os.makedirs(pasta, exist_ok=True); specs = PC.specs(); al = PC.alias()
    for civ in civs or CIVS:
        bpy.ops.wm.read_factory_settings(use_empty=True)
        kinds = PC.KINDS_SHEET
        items = []
        for k in kinds:
            own = al.get(k, {}).get(civ, civ)
            sel = [s for s in specs if s['kind'] == k and s['civ'] == own]
            if not sel: continue
            items.append(max(sel, key=lambda s: s['w'] * s['d']))
            for s in sel:
                if s.get('var') and s is not items[-1]: items.append(s)
        # (laid out in rows by their width: a gap between, the tall ones at the back)
        x = 0.0; row = 0; rows = [[]]; maxw = 9.5
        for s in items:
            if x + s['w'] > maxw: rows.append([]); x = 0.0
            rows[-1].append((x + s['w'] / 2, s)); x += s['w'] + 0.55
        y = 0.0; placed = []
        for r in rows:
            dep = max(s['d'] for _, s in r)
            for cx, s in r: placed.append((cx, y + dep / 2, s))
            y += dep + 0.75
        W = maxw; H = y
        def of(kind, h=None):
            own = al.get(kind, {}).get(civ, civ); sel = [q for q in specs if q['kind'] == kind and q['civ'] == own]
            if not sel: return None
            q = dict(sel[0]); q['h'] = h or q['h']; q['nome'] += '-folha'; return q
        for cx, cy, s in placed:
            M = build(s, lod); at = (cx - W / 2, 0, cy - H / 2); to_blender(M, at=at, name=s['nome'], civ=civ)
            # (what goes with the piece in the game: the flue over a hood, the amphorae in the rack — Build3D's modelled)
            for a in M.anc:
                q = of('chamine', 0.9) if a['k'] == 'chamine' else of('anfora') if a['k'] == 'nicho' and s['kind'] == 'anforeira' else None
                if q: to_blender(build(q, lod), at=(at[0] + a['x'], a['y'] - (0.04 if q['kind'] == 'anfora' else 0), at[2] + a['z']), name=q['nome'], civ=civ)
            label(s['kind'] + (' · ' + s['var'] if s.get('var') else ''), cx - W / 2, -(cy - H / 2 + s['d'] / 2 + 0.22), size=0.11)
        floor_plane(-W / 2 - 2, W / 2 + 2, -H / 2 - 2, H / 2 + 2)
        el = 50.0; vert = H * math.sin(math.radians(el)) + 2.3 * math.cos(math.radians(el))
        sc = scene_setup(2000, int(2000 * vert / (W + 1.0)), samples=20)
        camera(sc, (0, 0.25 * math.cos(math.radians(el)), 0.75), 30, el, 0, W + 1.0)
        f = os.path.join(pasta, f'moveis-{civ}{"-lod1" if lod else ""}.png'); sc.render.filepath = f; bpy.ops.render.render(write_still=True)
        print('folha', civ, len(placed), 'peças →', f)

if __name__ == '__main__':
    a = sys.argv[1:]
    if '--' in a: a = a[a.index('--') + 1:]
    if a and a[0] == '--prev': prev(a[1], a[2])
    elif a and a[0] == '--folha':
        lod = 0
        if '--lod' in a: i = a.index('--lod'); lod = int(a[i + 1]); a = a[:i] + a[i + 2:]
        folha(a[1], a[2:], lod)
    elif a and a[0] == '--conta': count()
    elif a and a[0] == '--confere': confere()
    else: export(a)
