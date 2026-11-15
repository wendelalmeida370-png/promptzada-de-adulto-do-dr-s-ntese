# fauna: makes js/faunamesh.js — the animals' meshes (each kind's body as one skin, and its pieces: eyes, hooves, horns,
# antlers, a mane, a beak), on the one skeleton of fauna_forma, with their weights, the regions their coat is painted by
# (the belly, the legs, the muzzle, the face, the tail, the ears, the back, the throat) and their occlusion; near and far.
#   venv/bin/python arte/fauna.py                 (all; the venv with bpy: see arte/ESTUDIO.md)
#   venv/bin/python arte/fauna.py deer,cavalo     (only some; the others kept from the last js/faunamesh.js)
#   venv/bin/python arte/fauna.py --prev SAIDA deer,cavalo   (a picture of each, from Blender, no file written)
# The shapes are in fauna_forma (families) and fauna_especies (the kinds); the clay and the decimator are the people's
# (corpo_sdf, corpo.decimate / occlusion). Deterministic: the same file every run.
import sys, os, json, time
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from corpo_sdf import mesh_of, normals_of
from corpo import decimate, occlusion, uvsphere, weld, b64
import fauna_forma as FF
import fauna_especies as FE

OUT = os.path.join(HERE, '..', 'js', 'faunamesh.js')
BONES, BI, ZONE = FF.BONES, FF.BI, FF.ZONE
SIDE = np.array([1 if (b.startswith(('flL', 'hlL')) or b == 'earL') else -1 if (b.startswith(('flR', 'hlR')) or b == 'earR') else 0 for b in BONES])
LEG = np.array([b[:2] in ('fl', 'hl') for b in BONES]); TAIL = np.array([b.startswith('tail') for b in BONES])
EAR = np.array([b.startswith('ear') for b in BONES]); HEAD = np.array([b in ('head', 'jaw', 'earL', 'earR', 'trunk0', 'trunk1', 'trunk2') for b in BONES])
NECK = np.array([b.startswith('neck') for b in BONES])


def weights(prims, V, H):
    """Each point's bones: every piece of clay pulls its bone by exp(-(d/tau)²); the left never reaches the right; four at most."""
    W = np.zeros((len(V), len(BONES))); dmin = np.full(len(V), 1e9); bmin = np.zeros(len(V), int)
    for p in prims:
        if p.bone is None or p.op != 'u': continue
        d = np.maximum(p.sdf(V), 0.0); c = np.exp(-(d / p.tau) ** 2)
        W[:, BI[p.bone]] += c; m = d < dmin; dmin[m] = d[m]; bmin[m] = BI[p.bone]
    fl = np.clip((V[:, 0] + H * 0.004) / (H * 0.008), 0, 1)
    W[:, SIDE > 0] *= fl[:, None]; W[:, SIDE < 0] *= (1 - fl)[:, None]
    s = W.sum(1); lost = s < 1e-6; W[lost, :] = 0; W[lost, bmin[lost]] = 1
    W /= W.sum(1, keepdims=True)
    return W


def pack(W):
    W = np.where(W < 0.02, 0, W); order = np.argsort(-W, axis=1)[:, :4]
    w = np.take_along_axis(W, order, 1); w = w / np.maximum(w.sum(1, keepdims=True), 1e-9)
    q = np.floor(w * 255 + 0.5).astype(int); q[:, 0] += 255 - q.sum(1); order = np.where(q > 0, order, 0)
    return order.astype(np.uint8), np.clip(q, 0, 255).astype(np.uint8)


def sm(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def regions(b, V, N, W):
    """What the coat's paint reads of each point (0..1): reg = (belly, down the leg, the muzzle, the head), reg2 = (along the
    tail, up the ear, the back's line, the throat and breast)."""
    J = b.bones_filled(); H = b.H; p = b.meta.get('p', {})
    legw = W[:, LEG].sum(1); headw = W[:, HEAD].sum(1); tailw = W[:, TAIL].sum(1); earw = W[:, EAR].sum(1); neckw = W[:, NECK].sum(1)
    trunk = np.clip(1 - legw - headw - tailw, 0, 1)
    under = sm(0.05, 0.75, -N[:, 1]) * np.clip(1 - headw * 0.6 - tailw, 0, 1) * np.maximum(trunk, neckw * 0.8)
    under = np.maximum(under, sm(0.2, 0.8, -N[:, 1]) * legw * sm(0.0, 0.3, V[:, 1] / H - 0.25))
    ely = J['flL1'][1] if 'flL1' in b.J else H * 0.5
    leg = legw * np.clip(1 - V[:, 1] / max(ely, 1e-3), 0, 1)
    nose = np.array(b.meta.get('nose', J['head'])); hl = max(p.get('headL', 0.3) * H, H * 0.05)
    muz = headw * sm(0.55, 0.0, np.linalg.norm(V - nose, axis=1) / hl)
    ch = [0.25, 0.5, 0.75, 1.0]; tpos = sum(W[:, BI['tail%d' % k]] * ch[k] for k in range(4))
    ear = np.zeros(len(V))
    for (a, t) in b.meta.get('ears', []):
        a = np.array(a); t = np.array(t); ab = t - a; u = np.clip((V - a) @ ab / max(ab @ ab, 1e-9), 0, 1); ear = np.maximum(ear, u * earw)
    hw = max(np.abs(V[:, 0]).max(), 1e-3)
    back = sm(0.45, 0.95, N[:, 1]) * sm(0.3, 0.0, np.abs(V[:, 0]) / hw) * np.clip(trunk + neckw, 0, 1)
    throat = np.clip(neckw + W[:, BI['chest']] * 0.8, 0, 1) * sm(0.1, 0.8, -N[:, 1] * 0.7 + N[:, 2] * 0.5) * sm(0.5, 0.15, np.abs(V[:, 0]) / hw)
    throat = np.maximum(throat, headw * sm(0.3, 0.9, -N[:, 1]) * (1 - muz))
    q = lambda a: np.clip(np.round(np.asarray(a) * 255), 0, 255).astype(np.uint8)
    return np.stack([q(under), q(leg), q(muz), q(headw)], 1), np.stack([q(tpos * (tailw > 0.05)), q(ear), q(back), q(throat)], 1)


def body_of(b, h, tris, fine=None):
    """The body: surface nets of its clay (kept for the lighter level), decimated, its normals, weights, regions, occlusion."""
    if fine is None:
        V0, Q = mesh_of(b.P, h, maxstep=1.5 * h); fine = (V0, Q)
    V0, Q = fine
    V, T = decimate(V0, Q, tris)
    if len(T) > 1.3 * tris: V, T = decimate(V0, Q, tris, split=True)
    N = normals_of(b.P, V); W = weights(b.P, V, b.H); bi, bw = pack(W)
    r1, r2 = regions(b, V, N, W)
    return dict(V=V, N=N, T=T, bi=bi, bw=bw, zone=np.zeros(len(V), np.uint8), r1=r1, r2=r2), fine


def piece_of(b, pc, h, tris):
    """A piece: its own mesh, zone and bones (rigid where it has one bone), no paint regions."""
    if 'eye' in pc:
        c, r = pc['eye']; nu, nv = (7, 5)
        V, T, N = uvsphere(np.array(c), r, nu, nv); V, T, keep = weld(V, T); N = N[keep]
    else:
        V0, Q = mesh_of(pc['P'], h, maxstep=1.5 * h)
        if len(V0) < 4: return None
        sym = V0[:, 0].min() < -1e-4 and V0[:, 0].max() > 1e-4  # (a piece on one side only: no mirror for the decimator to keep)
        V, T = decimate(V0, Q, max(8, tris), sym)
        N = normals_of(pc['P'], V)
    W = weights(pc['P'], V, b.H) if 'eye' not in pc else np.eye(len(BONES))[[BI['head']] * len(V)]
    bi, bw = pack(W)
    z = np.full(len(V), ZONE[pc['zone']], np.uint8)
    r2 = np.zeros((len(V), 4), np.uint8)
    if 'wing' in pc:  # (a wing: how far out along it each point is — its tip painted darker where the kind's are)
        sh, span = pc['wing']; r2[:, 0] = np.clip(np.round(np.linalg.norm(V - np.array(sh), axis=1) / max(span, 1e-3) * 255), 0, 255).astype(np.uint8)
    return dict(V=V, N=N, T=T, bi=bi, bw=bw, zone=z, r1=np.zeros((len(V), 4), np.uint8), r2=r2)


def merge(parts):
    out = {k: [] for k in ('V', 'N', 'T', 'bi', 'bw', 'zone', 'r1', 'r2')}; n = 0
    for m in parts:
        for k in out:
            out[k].append(m[k] + n if k == 'T' else m[k])
        n += len(m['V'])
    return {k: np.concatenate(v, 0) if k != 'T' else np.concatenate(v, 0).astype(np.int64) for k, v in out.items()}


def beast_meshes(b, near=760, far=160):
    """The near mesh (the body and every piece) and the far one (a lighter body, the pieces that read from afar)."""
    t0 = time.time(); H = b.H
    h = b.meta.get('h') or float(np.clip(H * 0.0105, 0.0025, 0.03))
    body, fine = body_of(b, h, near)
    parts = [body]; farp = []
    for pc in b.pieces:
        m = piece_of(b, pc, pc.get('h') or h * 0.7, pc['tris'])
        if m is None: continue
        parts.append(m)
        if pc['far'] and pc['far'] > 0 and 'eye' not in pc:
            mf = piece_of(b, pc, (pc.get('h') or h * 0.7) * 1.4, pc['far'])
            if mf is not None and len(mf['T']) <= max(pc['far'] * 1.6, 24): farp.append(mf)
    nearM = merge(parts)
    bf, _ = body_of(b, h, far, fine)
    farM = merge([bf] + farp)
    allV = nearM['V']
    occ = lambda M: occlusion(M['V'], M['T'], M['N'], dist=max(0.03, H * 0.18), n=28)
    nearM['ao'] = occ(nearM); farM['ao'] = occ(farM)
    eye = nearM['zone'] == ZONE['olhoL']; eye |= nearM['zone'] == ZONE['olhoR']; nearM['ao'][eye] = 0.9
    print('  %s: %d/%d triangles, %.1f s' % (b.name, len(nearM['T']), len(farM['T']), time.time() - t0)); sys.stdout.flush()
    J = b.bones_filled()
    box = [list(np.round(allV.min(0), 4)), list(np.round(allV.max(0), 4))]
    return nearM, farM, J, box


def encode(m):
    """A mesh, packed (format 2): the points reordered by their first use; positions in 16 bits over the mesh's box; the
    normal in two bytes (octahedral); four bones and three weights (the fourth is what is left of 255); the zone and the
    occlusion in one byte (4 bits each); the eight paint regions in 4 bits each; the triangles' corners as how far back
    from the next new point each one is (0: the next new point), in variable-length bytes. js/fauna3d.js unpacks it."""
    V, N, T = m['V'], m['N'], m['T']; n = len(V)
    seen = -np.ones(n, np.int64); order = []
    for i in T.reshape(-1):
        if seen[i] < 0: seen[i] = len(order); order.append(i)
    for i in range(n):
        if seen[i] < 0: seen[i] = len(order); order.append(i)
    order = np.array(order, np.int64); T = seen[T]
    V = V[order]; N = N[order]
    lo = V.min(0); hi = V.max(0); sc = np.maximum(hi - lo, 1e-6) / 65535.0
    q = np.clip(np.round((V - lo) / sc), 0, 65535).astype(np.uint16)
    Nn = N / np.maximum(np.abs(N).sum(1, keepdims=True), 1e-9); sx = np.where(Nn[:, 0] >= 0, 1.0, -1.0); sy = np.where(Nn[:, 1] >= 0, 1.0, -1.0)
    ox = np.where(Nn[:, 2] >= 0, Nn[:, 0], (1 - np.abs(Nn[:, 1])) * sx); oy = np.where(Nn[:, 2] >= 0, Nn[:, 1], (1 - np.abs(Nn[:, 0])) * sy)
    oct_ = np.clip(np.round(np.stack([ox, oy], 1) * 127), -127, 127).astype(np.int8)
    bw = m['bw'][order]; bi = m['bi'][order]
    za = ((m['zone'][order].astype(np.uint8) & 15) << 4) | np.clip(np.round(m['ao'][order] * 15), 0, 15).astype(np.uint8)
    n1 = np.clip(np.round(m['r1'][order] / 255.0 * 15), 0, 15).astype(np.uint8); n2 = np.clip(np.round(m['r2'][order] / 255.0 * 15), 0, 15).astype(np.uint8)
    rg = (n1 << 4) | n2
    ix = bytearray(); hw = 0
    for i in T.reshape(-1):
        if i == hw: c = 0; hw += 1
        else: c = hw - int(i)
        while True:
            b7 = c & 127; c >>= 7
            if c: ix.append(b7 | 128)
            else: ix.append(b7); break
    return {'f': 2, 'n': int(n), 'tris': int(len(T)), 'lo': [round(float(x), 6) for x in lo], 'sc': [float('%.9g' % x) for x in sc],
            'pos': b64(q), 'oct': b64(oct_), 'bi': b64(bi), 'bw3': b64(np.ascontiguousarray(bw[:, :3])), 'za': b64(za), 'rg': b64(rg),
            'ix': b64(np.frombuffer(bytes(ix), np.uint8))}


def load_old():
    if not os.path.exists(OUT): return {}, {}
    s = open(OUT).read(); a = s.index('G.FAUNAMESH = ') + len('G.FAUNAMESH = '); b = s.rindex('};') + 1
    try: d = json.loads(s[a:b]); return d.get('meshes', {}), d.get('forms', {})
    except Exception: return {}, {}


# ------------------------------ a picture, from Blender ------------------------------
ZCOL = {0: (0.62, 0.5, 0.36), 1: (0.05, 0.05, 0.05), 2: (0.05, 0.05, 0.05), 3: (0.75, 0.7, 0.6), 4: (0.15, 0.12, 0.1), 5: (0.1, 0.08, 0.07),
        6: (0.25, 0.18, 0.12), 7: (0.95, 0.92, 0.85), 8: (0.9, 0.7, 0.2), 9: (0.8, 0.1, 0.1), 10: (0.85, 0.82, 0.72), 11: (0.4, 0.35, 0.3), 12: (0.9, 0.9, 0.9), 13: (0.4, 0.38, 0.25), 14: (0.3, 0.28, 0.25)}


def prev(items, out):
    """Each beast's near mesh from the side, three-quarters, the front and above, the far one beside; a 1.75 m pole for
    scale (Cycles on the processor: no graphics card here)."""
    import bpy, math, mathutils
    from PIL import Image, ImageDraw
    shots = []
    for name, M, Mf in items:
        row = []
        for mesh, views in ((M, ('side', 'three', 'front', 'top')), (Mf, ('three',))):
            bpy.ops.wm.read_factory_settings(use_empty=True)
            sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.samples = 10; sc.cycles.device = 'CPU'
            sc.render.resolution_x = 320; sc.render.resolution_y = 260; sc.cycles.use_denoising = False
            w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
            w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.55, 0.6, 0.66, 1); w.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.9
            sun = bpy.data.lights.new('s', 'SUN'); sun.energy = 3.2; so = bpy.data.objects.new('s', sun); sc.collection.objects.link(so); so.rotation_euler = (math.radians(50), 0, math.radians(35))
            V = mesh['V'][:, [0, 2, 1]] * np.array([1, -1, 1])  # (game y-up/+z-forward → Blender z-up/-y-forward)
            me = bpy.data.meshes.new('b'); me.from_pydata(V.tolist(), [], mesh['T'].tolist()); me.update()
            col = me.color_attributes.new('c', 'FLOAT_COLOR', 'POINT')
            r1 = mesh['r1'] / 255.0; r2 = mesh['r2'] / 255.0
            for i, z in enumerate(mesh['zone']):
                c = np.array(ZCOL.get(int(z), (1, 0, 1)))
                if z == 0:
                    c = c * (1 - 0.45 * r1[i, 1]) * (1 - 0.3 * r2[i, 2]) + (np.array([0.95, 0.9, 0.8]) - c) * 0.6 * r1[i, 0]
                    c = c * (1 - 0.6 * r1[i, 2])
                col.data[i].color = (*np.clip(c, 0, 1) ** 2.2, 1)
            for pl in me.polygons: pl.use_smooth = True
            mat = bpy.data.materials.new('m'); mat.use_nodes = True; nt = mat.node_tree
            at = nt.nodes.new('ShaderNodeVertexColor'); at.layer_name = 'c'; nt.links.new(at.outputs['Color'], nt.nodes['Principled BSDF'].inputs['Base Color'])
            nt.nodes['Principled BSDF'].inputs['Roughness'].default_value = 0.8
            me.materials.append(mat)
            ob = bpy.data.objects.new('b', me); sc.collection.objects.link(ob)
            pole = bpy.data.meshes.new('p'); q = [(-0.02, -0.02, 0), (0.02, -0.02, 0), (0.02, 0.02, 0), (-0.02, 0.02, 0)]
            pole.from_pydata(q + [(x, y, 1.75) for x, y, _ in q], [], [(0, 1, 2, 3), (4, 5, 6, 7), (0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7)])
            po = bpy.data.objects.new('p', pole); sc.collection.objects.link(po)
            gnd = bpy.data.meshes.new('g'); gnd.from_pydata([(-50, -50, 0), (50, -50, 0), (50, 50, 0), (-50, 50, 0)], [], [(0, 1, 2, 3)]); go = bpy.data.objects.new('g', gnd); sc.collection.objects.link(go)
            lo = V.min(0); hi = V.max(0); size = float(max(np.max(hi - lo), 0.3)); c = (lo + hi) / 2
            po.location = (lo[0] - size * 0.3, c[1], 0)
            cam = bpy.data.cameras.new('c'); cam.type = 'ORTHO'; cam.ortho_scale = size * 1.5
            co = bpy.data.objects.new('c', cam); sc.collection.objects.link(co); sc.camera = co
            for vw in views:
                d = size * 3
                pos = {'side': (d, c[1], c[2]), 'front': (c[0], -d, c[2]), 'three': (d * 0.7, -d * 0.7, c[2] + d * 0.35), 'top': (c[0] + d * 0.2, c[1] - d * 0.3, d)}[vw]
                co.location = pos; dvec = mathutils.Vector(tuple(c)) - mathutils.Vector(pos); co.rotation_euler = dvec.to_track_quat('-Z', 'Y').to_euler()
                fn = out + '.tmp_%d.png' % len(row); sc.render.filepath = fn; bpy.ops.render.render(write_still=True)
                row.append(Image.open(fn).convert('RGB')); os.remove(fn)
        shots.append((name, row))
    w, hh = shots[0][1][0].size; sheet = Image.new('RGB', (w * 5, (hh + 16) * len(shots)), (30, 28, 26)); dr = ImageDraw.Draw(sheet)
    for k, (name, row) in enumerate(shots):
        for i, im in enumerate(row): sheet.paste(im, (i * w, k * (hh + 16)))
        dr.text((4, k * (hh + 16) + hh + 2), '%s  %d / %d tri' % (name, len(items[k][1]['T']), len(items[k][2]['T'])), fill=(240, 230, 210))
    sheet.save(out); print('prévia:', out)


def main(argv):
    prev_out = None
    if argv and argv[0] == '--prev': prev_out = argv[1]; argv = argv[2:]
    only = argv[0].split(',') if argv else None
    kinds = FE.kinds()
    meshes, forms = ({}, {}) if (not only or prev_out) else load_old()
    items = []; built = {}
    for kind in kinds:
        if only and kind not in only: continue
        spec = FE.SPECIES[kind]; mname = spec.get('mesh', kind)
        if mname in built: nearM, farM, J, box = built[mname]
        else:
            print(kind); sys.stdout.flush()
            b = FE.build(kind); nearM, farM, J, box = beast_meshes(b, spec.get('tris', 760), spec.get('far', 160)); built[mname] = (nearM, farM, J, box)
            meshes[mname] = encode(nearM); meshes[mname + '_1'] = encode(farM)
            forms[mname] = {'bind': [round(float(x), 5) for bn in BONES for x in J[bn]], 'box': box, 'meta': FE.meta_of(b)}
        items.append((kind, nearM, farM))
        if spec.get('fly'):
            fname = mname + '_voo'
            if fname not in built:
                print(kind, '(voo)'); sys.stdout.flush()
                b = FE.build(kind, fly=True); nM, fM, J2, box2 = beast_meshes(b, spec.get('tris', 760), spec.get('far', 160)); built[fname] = (nM, fM, J2, box2)
                meshes[fname] = encode(nM); meshes[fname + '_1'] = encode(fM)
                forms[fname] = {'bind': [round(float(x), 5) for bn in BONES for x in J2[bn]], 'box': box2, 'meta': FE.meta_of(b)}
            items.append((kind + ' voo', built[fname][0], built[fname][1]))
    if prev_out: prev(items, prev_out); return
    species = {k: FE.species_entry(k) for k in kinds}
    data = {'v': 1, 'bones': BONES, 'parent': [BONES.index(FF.PARENT[b]) if FF.PARENT[b] else -1 for b in BONES], 'zones': ZONE,
            'meshes': meshes, 'forms': forms, 'species': species}
    with open(OUT, 'w') as f:
        f.write("'use strict';\n// GENERATED by arte/fauna.py — do not edit by hand. The animals' meshes: each kind's body and its pieces, near\n"
                "// and far (name, name_1), on one skeleton (bones, parent), with their bind joints (forms), weights, the regions the\n"
                "// coat is painted by and an occlusion a point. Read by js/fauna3d.js.\n")
        f.write('(function (G) {\n  G.FAUNAMESH = ' + json.dumps(data, separators=(',', ':')) + ';\n})(window.G);\n')
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1:])
