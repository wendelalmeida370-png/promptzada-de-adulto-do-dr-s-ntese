# corpo: makes js/bodymesh.js — the people's meshes (bodies, eyes, hair, beards, clothes) with their bones and weights.
#   venv/bin/python arte/corpo.py            (≈ 10 min; the venv with bpy: see arte/ESTUDIO.md)
#   venv/bin/python arte/corpo.py corpoM     (only some meshes; the others kept from the last js/bodymesh.js)
# The shapes are in corpo_forma (clay: signed distance fields, corpo_sdf), turned into a fine mesh (surface nets),
# simplified by Blender (bpy, its decimator keeps detail where the shape bends: the face, the hands), lit by its own
# occlusion (rays against itself: armpits, the inside of the ear, under the chin), and weighted to the rig's bones: each
# piece of clay belongs to a bone, and a point of the skin follows the bones of the pieces it is nearest to. Where two
# bones meet (a knee, an elbow, the waist, the neck, a shoulder, a hip) the shared part goes to a "half" bone that turns
# half as much: the joint bends without the skin collapsing. Deterministic: the same file every run.
import sys, os, json, base64, time
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
from corpo_sdf import mesh_of, normals_of, field_at
import corpo_forma as CF
import corpo_roupa as CR

OUT = os.path.join(HERE, '..', 'js', 'bodymesh.js')

# the bones, in the order js/body3d.js writes them (the names are its contract)
BONES = ['pel', 'spine', 'chest', 'neck', 'head',
         'shL', 'shR', 'shHL', 'shHR', 'faL', 'faR', 'elHL', 'elHR', 'hdL', 'hdR', 'fgL', 'fgR', 'tbL', 'tbR',
         'thL', 'thR', 'hpHL', 'hpHR', 'snL', 'snR', 'knHL', 'knHR', 'ftL', 'ftR', 'toeL', 'toeR',
         'skF', 'skB', 'skL', 'skR', 'clk1', 'clk2', 'torch', 'tool', 'carry']
BI = {b: i for i, b in enumerate(BONES)}
# (parent, child) → the half bone between them
HALF = [('pel', 'chest', 'spine'), ('chest', 'head', 'neck'),
        ('chest', 'shL', 'shHL'), ('chest', 'shR', 'shHR'), ('shL', 'faL', 'elHL'), ('shR', 'faR', 'elHR'),
        ('pel', 'thL', 'hpHL'), ('pel', 'thR', 'hpHR'), ('thL', 'snL', 'knHL'), ('thR', 'snR', 'knHR')]
ZONE = {'body': 0, 'eyeL': 1, 'eyeR': 2, 'hair': 3, 'beard': 4, 'saiaC': 5, 'saiaL': 6, 'cape': 7, 'metal': 8, 'hat': 9, 'straw': 10, 'hood': 11, 'scarf': 12, 'gold': 13, 'fur': 14, 'toga': 15, 'nemes': 16, 'crista': 17, 'plumas': 18, 'tanga': 19, 'folha': 20}


# ------------------------------ Blender: the decimator ------------------------------
def decimate(V, F, tris, sym=True):
    import bpy, bmesh
    bpy.ops.wm.read_factory_settings(use_empty=True)
    me = bpy.data.meshes.new('m'); me.from_pydata(V.tolist(), [], F.tolist()); me.update()
    bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-7); bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new('m', me); bpy.context.scene.collection.objects.link(ob)
    n0 = sum(len(p.vertices) - 2 for p in me.polygons)
    mod = ob.modifiers.new('d', 'DECIMATE'); mod.decimate_type = 'COLLAPSE'; mod.ratio = min(1.0, tris / max(1, n0))
    mod.use_symmetry = sym; mod.symmetry_axis = 'X'
    dg = bpy.context.evaluated_depsgraph_get(); oe = ob.evaluated_get(dg); m2 = oe.to_mesh()
    V2 = np.array([v.co[:] for v in m2.vertices], dtype=np.float64)
    T2 = []
    for p in m2.polygons:
        vs = list(p.vertices)
        for k in range(1, len(vs) - 1): T2.append([vs[0], vs[k], vs[k + 1]])
    oe.to_mesh_clear()
    return V2, np.array(T2, dtype=np.int64)


def occlusion(V, T, N, dist=0.22, n=40, extra=None):
    """How much of the sky each point sees, from rays against the mesh itself (a fixed set of directions) — and against
    what it sits on (extra: the body under a hair, a skirt)."""
    from mathutils.bvhtree import BVHTree
    from mathutils import Vector
    if extra is not None:
        V2, T2 = extra; T = np.vstack([T, T2 + len(V)]); Vb = np.vstack([V, V2])
    else: Vb = V
    bvh = BVHTree.FromPolygons([tuple(v) for v in Vb], [tuple(int(i) for i in t) for t in T])
    k = np.arange(n) + 0.5; z = 1 - k / n; r = np.sqrt(1 - z * z); a = k * np.pi * (3 - np.sqrt(5))
    H = np.stack([r * np.cos(a), r * np.sin(a), z], 1)  # (a hemisphere round +Z, denser toward the top)
    out = np.ones(len(V))
    for i in range(len(V)):
        nn = N[i]; t = np.cross(nn, [0, 1, 0] if abs(nn[1]) < 0.9 else [1, 0, 0]); t /= np.linalg.norm(t); b = np.cross(nn, t)
        D = H[:, 0:1] * t + H[:, 1:2] * b + H[:, 2:3] * nn
        o = Vector(V[i] + nn * 0.0015); hit = 0.0; tot = 0.0
        for d, c in zip(D, H[:, 2]):
            loc, _n, _i, dd = bvh.ray_cast(o, Vector(d), dist)
            tot += c
            if loc is not None: hit += c * (1 - (dd / dist) ** 2)
        out[i] = 1 - hit / tot
    return out


# ------------------------------ weights ------------------------------
def weights(prims, V, extra=None):
    """Each point's bones: every piece of clay pulls its bone by exp(-(d/tau)²), d the point's distance to it; a bone of
    the left side never reaches across to the right; shared joints go to their half bones; four at most."""
    W = np.zeros((len(V), len(BONES)))
    dmin = np.full(len(V), 1e9); bmin = np.zeros(len(V), int)
    for p in prims:
        if p.bone is None or p.op != 'u': continue
        d = np.maximum(p.sdf(V), 0.0)
        c = np.exp(-(d / p.tau) ** 2)
        bones = p.bone if isinstance(p.bone, dict) else {p.bone: 1.0}
        for b, f in bones.items(): W[:, BI[b]] += c * f
        nb = max(bones, key=lambda q: bones[q]); m = d < dmin; dmin[m] = d[m]; bmin[m] = BI[nb]
    x = V[:, 0]; fl = np.clip((x + 0.004) / 0.008, 0, 1)
    for b, i in BI.items():
        if b.endswith('L'): W[:, i] *= fl
        elif b.endswith('R'): W[:, i] *= 1 - fl
    s = W.sum(1); lost = s < 1e-6
    W[lost, :] = 0; W[lost, bmin[lost]] = 1; W /= W.sum(1, keepdims=True)
    for a, b, h in HALF:
        sh = np.minimum(W[:, BI[a]], W[:, BI[b]])
        W[:, BI[h]] += 2 * sh; W[:, BI[a]] -= sh; W[:, BI[b]] -= sh
    return pack(W)


def pack(W):
    """The four strongest bones of each point, the weights in 255ths that sum to 255."""
    W = np.where(W < 0.015, 0, W)
    order = np.argsort(-W, axis=1)[:, :4]
    w = np.take_along_axis(W, order, 1); w = w / np.maximum(w.sum(1, keepdims=True), 1e-9)
    q = np.floor(w * 255 + 0.5).astype(int); q[:, 0] += 255 - q.sum(1)
    order = np.where(q > 0, order, 0)
    return order.astype(np.uint8), np.clip(q, 0, 255).astype(np.uint8)


# ------------------------------ meshes ------------------------------
def uvsphere(c, r, nu=14, nv=10):
    V = []; T = []
    for j in range(nv + 1):
        th = np.pi * j / nv
        for i in range(nu):
            ph = 2 * np.pi * i / nu
            V.append(c + r * np.array([np.sin(th) * np.sin(ph), np.cos(th), np.sin(th) * np.cos(ph)]))
    for j in range(nv):
        for i in range(nu):
            a = j * nu + i; b = j * nu + (i + 1) % nu; cc = (j + 1) * nu + i; d = (j + 1) * nu + (i + 1) % nu
            if j > 0: T.append([a, cc, b])
            if j < nv - 1: T.append([b, cc, d])
    V = np.array(V)
    # (the poles collapse to one point each: drop the duplicates)
    return V, np.array(T), (V - c) / r


def weld(V, T, eps=1e-7):
    key = np.round(V / eps).astype(np.int64)
    _, first, inv = np.unique(key, axis=0, return_index=True, return_inverse=True)
    inv = inv.ravel()
    T2 = inv[T]; ok = (T2[:, 0] != T2[:, 1]) & (T2[:, 1] != T2[:, 2]) & (T2[:, 0] != T2[:, 2])
    return V[first], T2[ok], first


def body_mesh(fem, h, tris, eyes=(14, 10)):
    t0 = time.time()
    P = CF.body(fem)
    V, Q = mesh_of(P, h)
    print('  surface nets: %d points, %.0f s' % (len(V), time.time() - t0)); sys.stdout.flush()
    V, T = decimate(V, Q, tris)
    N = normals_of(P, V)
    bi, bw = weights(P, V)
    zone = np.zeros(len(V), np.uint8)
    ao = occlusion(V, T, N)
    print('  decimated to %d points, %d triangles; weights, occlusion: %.0f s' % (len(V), len(T), time.time() - t0)); sys.stdout.flush()
    # the eyes: their own spheres, the head's, with no occlusion of their own (the lids are painted); none on the farthest
    # body — its sockets painted (body3d)
    for k, (c, r) in enumerate(CF.eyes(fem) if eyes else []):
        ev, et, en = uvsphere(c, r, *eyes)
        ev, et, keep = weld(ev, et); en = en[keep]
        n0 = len(V); V = np.vstack([V, ev]); T = np.vstack([T, et + n0]); N = np.vstack([N, en])
        bi = np.vstack([bi, np.tile(np.array([[BI['head'], 0, 0, 0]], np.uint8), (len(ev), 1))])
        bw = np.vstack([bw, np.tile(np.array([[255, 0, 0, 0]], np.uint8), (len(ev), 1))])
        zone = np.concatenate([zone, np.full(len(ev), ZONE['eyeL' if k == 0 else 'eyeR'], np.uint8)])
        ao = np.concatenate([ao, np.full(len(ev), 0.85)])
    return dict(V=V, N=N, T=T, bi=bi, bw=bw, zone=zone, ao=ao)


# ------------------------------ the pieces worn over the body ------------------------------
def smooth(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)


def w_rule(V, rule):
    """Weights from where a point is (for the pieces whose clay has no bones of its own: a skirt, a cape, a hood)."""
    W = np.zeros((len(V), len(BONES))); x, y, z = V[:, 0], V[:, 1], V[:, 2]
    if rule == 'skirt':
        # (the waist with the pelvis; below, the front with the leg most forward, the back with the one behind, the sides
        # with their own — blended round the body)
        th = np.arctan2(x, z); f = np.maximum(0, np.cos(th)) ** 2; b = np.maximum(0, -np.cos(th)) ** 2; l = np.maximum(0, np.sin(th)) ** 2; r = np.maximum(0, -np.sin(th)) ** 2
        # (in front, under the waist the cloth folds at the hip's crease as the thigh comes up — it does not turn with it)
        down = smooth(1.0, 0.8, y) * (1 - f) + smooth(0.98, 0.6, y) * f; W[:, BI['pel']] = 1 - down
        for k, w in (('skF', f), ('skB', b), ('skL', l), ('skR', r)): W[:, BI[k]] = down * w
    elif rule == 'cape':
        # (the yoke on the shoulders — modelled on them with the arms hanging —, the collar and the brooch with the chest;
        # the hanging part with the cape's own bones, the upper then the lower; an arm raised pushes the cloth out (body3d))
        front = smooth(-0.06, 0.0, z)
        top = np.maximum(smooth(1.36, 1.44, y), front * smooth(1.3, 1.36, y)); low = smooth(1.05, 0.85, y)
        W[:, BI['chest']] = top; W[:, BI['clk1']] = (1 - top) * (1 - low); W[:, BI['clk2']] = (1 - top) * low
    elif rule == 'toga':
        # (the band and the ends above the hips with the chest; below, as a skirt: the front with the leg most forward, the
        # back with the one behind, the sides with their own — blended round the body)
        th = np.arctan2(x, z); f = np.maximum(0, np.cos(th)) ** 2; b = np.maximum(0, -np.cos(th)) ** 2; l = np.maximum(0, np.sin(th)) ** 2; r = np.maximum(0, -np.sin(th)) ** 2
        up = smooth(0.9, 1.06, y); W[:, BI['chest']] = up
        down = (1 - up) * smooth(0.95, 0.75, y); W[:, BI['pel']] = (1 - up) - down
        for k, w in (('skF', f), ('skB', b), ('skL', l), ('skR', r)): W[:, BI[k]] = down * w
    elif rule == 'hood':
        c = smooth(1.5, 1.6, y); W[:, BI['head']] = c; W[:, BI['chest']] = 1 - c
    W /= np.maximum(W.sum(1, keepdims=True), 1e-9)
    return pack(W)


LODS = (1.0, 0.35, 0.12)   # (each piece in three: near, a few steps off, far — the share of its triangles)


def piece_mesh(prims, zone, h, tris, rule=None, body=None, sym=True, lods=LODS):
    """A piece, decimated from the same fine mesh to each level of detail: a list, the nearest first."""
    t0 = time.time()
    V0, Q = mesh_of(prims, h, maxstep=1.5 * h)
    out = []
    for f in lods:
        V, T = decimate(V0, Q, max(60, int(tris * f)), sym)
        out.append(piece_of(prims, zone, V, T, rule, body))
    print('  %s: %s triangles, %.0f s' % (zone, '/'.join(str(len(m['T'])) for m in out), time.time() - t0)); sys.stdout.flush()
    return out


def piece_of(prims, zone, V, T, rule, body):
    N = normals_of(prims, V)
    if rule: bi, bw = w_rule(V, rule)
    else: bi, bw = weights(prims, V)
    # (the zone of each point: the piece's own, or the tag of the piece of clay it lies on — the cape's pin is metal)
    zn = np.full(len(V), ZONE[zone], np.uint8)
    tagged = [p for p in prims if p.tag and p.op == 'u']
    if tagged:
        best = np.full(len(V), 1e9); bz = zn.copy()
        for p in prims:
            if p.op != 'u': continue
            d = np.abs(p.sdf(V)); m = d < best; best[m] = d[m]; bz[m] = ZONE[p.tag] if p.tag else ZONE[zone]
        zn = bz
    ao = occlusion(V, T, N, extra=body)
    return dict(V=V, N=N, T=T, bi=bi, bw=bw, zone=zn, ao=ao)


_BODY = {}
def torso_occluder():
    # (the body without its arms: what a cloak's own shadow is cast by — in the bind the arms are out through its sides,
    # in the world they hang inside it)
    if 't' not in _BODY:
        P = CR.no_arms(CF.body(0.0)); V, Q = mesh_of(P, 0.012); _BODY['t'] = (V, np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]]))
    return _BODY['t']


def body_occluder():
    # (the man's body as the eyes of the occlusion see it: what the pieces sit on)
    if 'm' not in _BODY:
        P = CF.body(0.0); V, Q = mesh_of(P, 0.012); _BODY['m'] = (V, np.concatenate([Q[:, [0, 1, 2]], Q[:, [0, 2, 3]]]))
    return _BODY['m']


# ------------------------------ export ------------------------------
def b64(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode('ascii')


def encode(m):
    V = m['V']; lo = V.min(0); hi = V.max(0); sc = np.maximum(hi - lo, 1e-6) / 65535.0
    q = np.clip(np.round((V - lo) / sc), 0, 65535).astype(np.uint16)
    n = np.clip(np.round(m['N'] * 127), -127, 127).astype(np.int8)
    T = m['T'].astype(np.uint16 if len(V) < 65536 else np.uint32)
    return {'n': int(len(V)), 'tris': int(len(T)), 'lo': [round(float(x), 6) for x in lo], 'sc': [float('%.9g' % x) for x in sc],
            'pos': b64(q), 'nor': b64(n), 'bi': b64(m['bi']), 'bw': b64(m['bw']), 'zone': b64(m['zone'].astype(np.uint8)),
            'ao': b64(np.clip(np.round(m['ao'] * 255), 0, 255).astype(np.uint8)), 'idx': b64(T), 'i32': bool(len(V) >= 65536)}


def load_old():
    if not os.path.exists(OUT): return {}
    s = open(OUT).read(); a = s.index('G.BODYMESH = ') + len('G.BODYMESH = '); b = s.rindex('};') + 1
    try: return json.loads(s[a:b]).get('meshes', {})
    except Exception: return {}


def main(only):
    J = CF.joints()
    bind = {k: [round(float(x), 6) for x in v] for k, v in J.items()}
    meshes = load_old() if only else {}
    jobs = {'corpoM': lambda: body_mesh(0.0, 0.0045, 7600), 'corpoF': lambda: body_mesh(1.0, 0.0045, 7600),
            # (a few steps off: the same body with a third of the triangles, lighter eyes; far: a few hundred, no eyeballs)
            'corpoM_1': lambda: body_mesh(0.0, 0.006, 2400, (8, 6)), 'corpoF_1': lambda: body_mesh(1.0, 0.006, 2400, (8, 6)),
            'corpoM_2': lambda: body_mesh(0.0, 0.008, 480, None), 'corpoF_2': lambda: body_mesh(1.0, 0.008, 480, None)}
    for st in ('curto', 'longo', 'trancas', 'coque', 'careca', 'rabo', 'chanel', 'peruca'):
        jobs[st] = (lambda st: lambda: piece_mesh(CR.hair(st), 'hair', 0.0032, 1400 if st in ('curto', 'careca') else 2200, body=body_occluder()))(st)
    for st in ('barba', 'curta', 'bigode'):
        jobs[st] = (lambda st: lambda: piece_mesh(CR.beard(st), 'beard', 0.003, 700 if st == 'bigode' else 1100, body=body_occluder(), lods=LODS[:2]))(st)
    # (the skirts: their folds need the triangles)
    jobs['saiaC'] = lambda: piece_mesh(CR.skirt(False), 'saiaC', 0.004, 1600, rule='skirt', body=body_occluder())
    jobs['saiaL'] = lambda: piece_mesh(CR.skirt(True), 'saiaL', 0.0045, 2400, rule='skirt', body=body_occluder())
    jobs['capa'] = lambda: piece_mesh(CR.cape(), 'cape', 0.0045, 2200, rule='cape', body=torso_occluder(), sym=False)
    jobs['toga'] = lambda: piece_mesh(CR.toga(), 'toga', 0.0038, 2600, rule='toga', body=torso_occluder(), sym=False)
    # (the hats; the south's crested helmet, the pharaoh's headcloth, the feathers of the jungle, the laurel)
    for st, z, n in (('gorro', 'hat', 1300), ('elmo', 'metal', 1300), ('chapeu', 'straw', 1300), ('capuz', 'hood', 1300), ('lenco', 'scarf', 1300), ('coroa', 'gold', 600),
                     ('galea', 'metal', 1400), ('nemes', 'nemes', 1600), ('penacho', 'plumas', 1400), ('louro', 'folha', 700)):
        jobs[st] = (lambda st, z, n: lambda: piece_mesh(CR.hat(st), z, 0.0035, n, rule='hood' if st == 'capuz' else None, body=body_occluder(), lods=LODS[:2] if st in ('coroa', 'louro') else LODS))(st, z, n)
    jobs['tanga'] = lambda: piece_mesh(CR.piece('tanga'), 'tanga', 0.004, 900, rule='skirt', body=body_occluder())
    for name, f in jobs.items():
        if only and name not in only: continue
        print(name); sys.stdout.flush()
        m = f()
        # (a piece in its levels of detail: name, name_1, name_2 — the farther ones lighter; for a piece with fewer levels
        # its lightest stands in farther off: body3d)
        if isinstance(m, list):
            # (a level the decimator could not make much lighter than the one before — a piece too thin for it to simplify —
            # is left out: the one before stands in)
            keep = [m[0]]
            for mk in m[1:]:
                if len(mk['T']) >= 0.85 * len(keep[-1]['T']): break
                keep.append(mk)
            for k, mk in enumerate(keep): meshes[name + ('_%d' % k if k else '')] = encode(mk)
            for k in range(len(keep), len(LODS)): meshes.pop(name + '_%d' % k, None)
        else: meshes[name] = encode(m)
    data = {'v': 1, 'bones': BONES, 'bind': bind, 'roll': CF.BIND_ROLL, 'shin': CF.SHIN, 'knuckle': CF.KNUCKLE, 'toe': CF.TOE_Z, 'toeY': CF.TOE_Y,
            'zones': ZONE, 'hem': {'saiaC': 0.5, 'saiaL': 0.12, 'cape': 0.55}, 'meshes': meshes}
    with open(OUT, 'w') as f:
        f.write("'use strict';\n// GENERATED by arte/corpo.py — do not edit by hand. The people's meshes: bodies, eyes, hair, clothes, with their\n"
                "// bones (positions quantized to 16 bits over each mesh's box, normals 8 bits, four bones and weights a point, an\n"
                "// occlusion a point). Read by js/body3d.js.\n")
        f.write('(function (G) {\n  G.BODYMESH = ' + json.dumps(data, separators=(',', ':')) + ';\n})(window.G);\n')
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main(sys.argv[1:])
