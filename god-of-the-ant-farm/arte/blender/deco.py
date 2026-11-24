# deco: the small things the interiors show, modelled by code in Blender and written as one data file the game reads without
# fetching anything — js/decomesh.js: each thing a G.MESH3D entry 'deco-<coisa>' (and 'deco-<coisa>@1', its middle level of
# detail), in the format G.Mesh3D reads (the furniture's: arte/blender/moveis.py), with what the game needs to set it down: its
# kind, its size, how it rests (pousa: 'base' on its foot, 'pende' hung by its top, 'parede' flat on a wall) and its anchors
# (the flame of a lamp, of a candle). The interiors 2.0, the front P5 (D-740 to D-749): the things are drawn by js/dentro3d.js
# (G.Dentro3D) where G.Atmos.within says the building has them — the decoration has its cause, never a draw.
#   VENV/bin/python arte/blender/deco.py                     → every thing, the file written again
#   VENV/bin/python arte/blender/deco.py jarra pao           → only those (the others kept from the file)
#   VENV/bin/python arte/blender/deco.py --folha SAIDA.png [--lod 1]   → the sheet of them all, by Cycles (nothing written)
#   VENV/bin/python arte/blender/deco.py --conta             → the triangles and the size of each (nothing written)
#   VENV/bin/python arte/blender/deco.py --prev SAIDA.png coisa ...   → those things in their own colours, by Cycles (nothing written)
# The shapes: arte/blender/deco_coisas.py and, what is served at the tables and the marks of the night, deco_comida.py (on the
# furniture's moveis_forma.py). The dishes and the drinks are G.MESH3D 'comida-<prato>' and 'bebida-<bebida>' (the part of the food
# they are made of, the drink — js/act-taverna.js), the others 'deco-<coisa>'. The budget (D-745, D-748): the file ≤ 2.5 MB, each
# thing ≤ 700 triangles at its near level (the rug, the hanging, the cauldron, the firewood ≤ 1,400; a dish or a drink, with its
# bites, its levels and its steam, ≤ 1,600), its middle level ≤ 70 % of it (or ≤ 200). Nothing is drawn by chance: the same
# script, the same file, byte for byte.
import sys, os, re, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import moveis_forma as F
import moveis as MV
import deco_coisas as C
import deco_comida as C2  # (its colours of each point hook the shapes: imported before any is made)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'js', 'decomesh.js')
PARTS = ['louca', 'barro', 'tampa', 'madeira', 'madeira2', 'pano', 'pano2', 'corda', 'palha', 'saco', 'comida', 'conteudo', 'liquido', 'pao', 'carne',
         'peixe', 'alho', 'erva', 'milho', 'cabaca', 'queijo', 'lampada', 'cera', 'castical', 'panela', 'ferro', 'carvao', 'teia',
         # (what is served — its bites, its levels, its remains, a beer's head, the steam, what lies under it: deco_comida.py —, the
         # candle as much of it as is left, the marks of the night, the boards at the door)
         'b1', 'b2', 'b3', 'b4', 'f1', 'f2', 'f3', 'f4', 'n0', 'n1', 'n2', 'n3', 'nv', 'r1', 'r2', 'r3', 'r4', 'e0', 'e1', 'vapor', 'resto',
         'cera0', 'cera1', 'cera2', 'cera3', 'osso', 'mancha', 'ardosia', 'escrita', 'giz', 'tinta', 'tinta2']
BIG = {'tapete', 'tapecaria', 'caldeirao', 'lenha'}
BUDGET = {'coisa': 700, 'grande': 1400, 'prato': 1600, 'meio': 0.7, 'meioMin': 200, 'arquivo': 2.5}
SERVED = ('comida-', 'bebida-')  # (the dishes and the drinks: named as they are, their budget a dish's)
# (kind, w, d, h, the builder, how it rests)
TABLE = [
    # ---- the drink and what it is poured from ----
    ('jarra', 0.22, 0.18, 0.30, C.jarra, 'base'), ('jarra-alta', 0.18, 0.18, 0.40, C.jarra_alta, 'base'), ('anforeta', 0.20, 0.20, 0.50, C.anforeta, 'base'),
    ('pote', 0.24, 0.24, 0.28, C.pote, 'base'), ('cabaca', 0.20, 0.20, 0.33, C.cabaca, 'base'), ('jarro-madeira', 0.22, 0.18, 0.30, C.jarro_madeira, 'base'),
    # ---- the cups, the bowls, the plates, the bread ----
    ('caneca', 0.16, 0.10, 0.12, C.caneca, 'base'), ('taca', 0.20, 0.13, 0.09, C.taca, 'base'), ('copo', 0.12, 0.12, 0.08, C.copo, 'base'), ('caneca-madeira', 0.16, 0.11, 0.10, C.caneca_madeira, 'base'),
    ('tigela', 0.17, 0.17, 0.075, C.tigela, 'base'), ('prato', 0.24, 0.24, 0.06, C.prato, 'base'), ('prato-peixe', 0.27, 0.17, 0.06, C.prato_peixe, 'base'),
    ('pao', 0.18, 0.18, 0.10, C.pao, 'base'), ('tortilhas', 0.18, 0.18, 0.035, C.tortilhas, 'base'), ('queijo', 0.21, 0.21, 0.09, C.queijo, 'base'),
    # ---- what hangs ----
    ('presunto', 0.18, 0.14, 0.50, C.presunto, 'pende'), ('peixe-seco', 0.20, 0.06, 0.42, C.peixe_seco, 'pende'), ('alho', 0.14, 0.10, 0.52, C.alho, 'pende'),
    ('ervas', 0.16, 0.12, 0.36, C.ervas, 'pende'), ('milho', 0.16, 0.12, 0.42, C.milho, 'pende'),
    # ---- what stands on the floor ----
    ('saco', 0.36, 0.32, 0.50, C.saco, 'base'), ('cesto', 0.32, 0.32, 0.33, C.cesto, 'base'), ('lenha', 0.62, 0.36, 0.32, C2.lenha_pilha, 'base'),
    ('panela', 0.30, 0.26, 0.24, C.panela, 'base'), ('caldeirao', 0.62, 0.62, 0.80, C.caldeirao, 'base'),
    # ---- the light ----
    ('lamparina', 0.10, 0.16, 0.06, C.lamparina, 'base'), ('vela', 0.09, 0.09, 0.20, C2.vela_noite, 'base'),
    # ---- cloth ----
    ('pano-dobrado', 0.42, 0.32, 0.12, C.pano_dobrado, 'base'), ('tapete', 1.60, 1.00, 0.012, C.tapete, 'base'), ('tapecaria', 1.00, 0.06, 1.30, C.tapecaria, 'parede'),
    # ---- on the walls, in the corners ----
    ('cavilha', 0.03, 0.08, 0.03, C.cavilha, 'parede'), ('suporte', 0.2, 0.15, 0.15, C.suporte, 'parede'),
    ('rabisco-a', 0.30, 0.006, 0.14, C.rabisco('a'), 'parede'), ('rabisco-b', 0.28, 0.006, 0.22, C.rabisco('b'), 'parede'),
    ('rabisco-c', 0.16, 0.006, 0.20, C.rabisco('c'), 'parede'), ('rabisco-d', 0.26, 0.006, 0.14, C.rabisco('d'), 'parede'),
    ('teia', 0.30, 0.30, 0.30, C.teia, 'canto'),
    # ---- what is served at the tables (D-748): the dishes by the part of the food they are made of, the drinks in their own cups
    ('comida-peixe', 0.27, 0.17, 0.20, C2.comida_peixe, 'base'), ('comida-carne', 0.24, 0.24, 0.20, C2.comida_carne, 'base'),
    ('comida-marisco', 0.24, 0.24, 0.20, C2.comida_marisco, 'base'), ('comida-arroz', 0.17, 0.17, 0.23, C2.comida_arroz, 'base'),
    ('comida-trigo', 0.24, 0.24, 0.22, C2.comida_trigo, 'base'), ('comida-cevada', 0.24, 0.18, 0.22, C2.comida_cevada, 'base'),
    ('comida-horta', 0.24, 0.18, 0.22, C2.comida_horta, 'base'), ('comida-sorgo', 0.24, 0.18, 0.22, C2.comida_sorgo, 'base'),
    ('comida-leite', 0.24, 0.18, 0.10, C2.comida_leite, 'base'), ('comida-provisao', 0.24, 0.18, 0.22, C2.comida_provisao, 'base'),
    ('comida-milho', 0.24, 0.24, 0.18, C2.comida_milho, 'base'), ('comida-ovos', 0.23, 0.23, 0.17, C2.comida_ovos, 'base'),
    ('comida-fruta', 0.17, 0.17, 0.11, C2.comida_fruta, 'base'), ('comida-mel', 0.24, 0.24, 0.06, C2.comida_mel, 'base'),
    ('comida-azeite', 0.24, 0.24, 0.04, C2.comida_azeite, 'base'),
    ('bebida-cerveja', 0.16, 0.10, 0.13, C2.bebida_cerveja, 'base'), ('bebida-cerveja-copo', 0.12, 0.12, 0.10, C2.bebida_cerveja_copo, 'base'),
    ('bebida-vinho', 0.19, 0.13, 0.09, C2.bebida_vinho, 'base'), ('bebida-vinho-copo', 0.12, 0.12, 0.085, C2.bebida_vinho_copo, 'base'),
    ('bebida-pulque', 0.14, 0.14, 0.06, C2.bebida_pulque, 'base'), ('bebida-mel', 0.12, 0.08, 0.17, C2.bebida_mel, 'base'),
    ('bebida-mel-caneca', 0.16, 0.10, 0.12, C2.bebida_mel_caneca, 'base'),
    # ---- the marks of the night (D-749): the rings of beer on the boards, a game's knucklebones, a broken mug, a fallen one, a spill
    ('mancha-a', 0.14, 0.12, 0.002, C2.mancha('a'), 'base'), ('mancha-b', 0.12, 0.12, 0.002, C2.mancha('b'), 'base'),
    ('mancha-c', 0.13, 0.10, 0.002, C2.mancha('c'), 'base'), ('mancha-d', 0.08, 0.07, 0.002, C2.mancha('d'), 'base'),
    ('ossos', 0.12, 0.09, 0.02, C2.ossos, 'base'), ('cacos', 0.26, 0.20, 0.04, C2.cacos, 'base'), ('caneca-caida', 0.11, 0.11, 0.10, C2.caneca_caida, 'base'),
    ('poca', 0.40, 0.35, 0.003, C2.poca, 'base'),
    # ---- at the door: the slate, the board, the painted plaque (the words are the game's: what the kitchen has today); the keeper's cloth
    ('lousa', 0.40, 0.03, 0.55, C2.lousa, 'parede'), ('quadro', 0.56, 0.05, 0.45, C2.quadro, 'parede'), ('placa', 0.60, 0.03, 0.36, C2.placa, 'parede'),
    ('pano-ombro', 0.13, 0.17, 0.32, C2.pano_ombro, 'base'),
]
# (the colours of the sheet's pictures — near what the game paints: js/dentro3d.js; linear, for Cycles)
DCOR = {'louca': (0.46, 0.18, 0.08), 'barro': (0.46, 0.18, 0.08), 'tampa': (0.30, 0.20, 0.12), 'madeira': (0.30, 0.17, 0.085), 'madeira2': (0.17, 0.095, 0.05),
        'pano': (0.62, 0.56, 0.45), 'pano2': (0.42, 0.14, 0.10), 'corda': (0.40, 0.30, 0.16), 'palha': (0.52, 0.40, 0.18), 'saco': (0.42, 0.34, 0.22),
        'comida': (0.62, 0.40, 0.18), 'conteudo': (0.55, 0.12, 0.08), 'liquido': (0.09, 0.04, 0.02), 'pao': (0.55, 0.30, 0.10), 'carne': (0.42, 0.12, 0.07),
        'peixe': (0.45, 0.38, 0.28), 'alho': (0.82, 0.78, 0.70), 'erva': (0.16, 0.30, 0.08), 'milho': (0.80, 0.52, 0.08), 'cabaca': (0.55, 0.40, 0.16),
        'queijo': (0.80, 0.62, 0.25), 'lampada': (0.46, 0.18, 0.08), 'cera': (0.85, 0.78, 0.58), 'castical': (0.30, 0.20, 0.10), 'panela': (0.06, 0.06, 0.06),
        'ferro': (0.05, 0.05, 0.048), 'carvao': (0.03, 0.03, 0.03), 'teia': (0.75, 0.75, 0.72),
        'osso': (1, 1, 1), 'mancha': (0.12, 0.07, 0.035), 'ardosia': (0.03, 0.035, 0.035), 'escrita': (0.04, 0.045, 0.045), 'giz': (1, 1, 1), 'tinta': (0.42, 0.12, 0.08), 'tinta2': (0.5, 0.36, 0.08)}
for _k in ('b1', 'b2', 'b3', 'b4', 'n0', 'n1', 'n2', 'n3', 'nv', 'r1', 'r2', 'r3', 'r4', 'e0', 'e1', 'resto', 'vapor'): DCOR[_k] = (1, 1, 1)
for _k in ('f1', 'f2', 'f3', 'f4'): DCOR[_k] = (0.45, 0.07, 0.05)
for _k in ('cera0', 'cera1', 'cera2', 'cera3'): DCOR[_k] = DCOR['cera']

def nome(k): return k if k.startswith(SERVED) else 'deco-' + k

def spec(row):
    k, w, d, h, fn, pousa = row
    return {'kind': k, 'nome': nome(k), 'w': w, 'd': d, 'h': h, 'fn': fn, 'pousa': pousa, 'civ': '', 'var': ''}

def build(s, lod):
    M = F.Modelo(s['nome'], lod); s['fn'](M, s['w'], s['d'], s['h'])
    # (the things of deco_comida.py lit part by part: what comes and goes seen only with what is always there)
    if getattr(s['fn'], '__module__', '') == 'deco_comida': C2.bake(M, rays=16 if lod == 0 else 10, dist=0.2)
    else: F.bake_ao(M, rays=16 if lod == 0 else 10, dist=0.2, floor=s['pousa'] == 'base')
    return M

def lin(x): x = max(0.0, min(1.0, x)); return x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4

def encode_cor(M, spec):
    """the furniture's encoder (moveis.py encode), the colour of each point its own where the shape gave it one (deco_comida.py:
    the dish's colours, its light baked in with them) — the same bytes as the furniture's where none did"""
    import numpy as np, base64
    P, N, UV, C, idx, parts = [], [], [], [], [], []
    for name in sorted(M.parts, key=lambda k: (MV.PC.PART_ORDER.index(k) if k in MV.PC.PART_ORDER else 99, k)):
        q = M.parts[name]
        if not q.T: continue
        keys = {}; start = len(idx); rem = {}; K = q.__dict__.get('K') or []
        for i, (p, n, uv, a) in enumerate(zip(q.P, q.N, q.UV, q.C)):
            qn = tuple(int(round(c * 127)) for c in n); k = K[i] if i < len(K) else None
            if k is None: ql = round(MV.srgb(a) * 255); col = (ql, ql, ql)
            else: col = tuple(round(MV.srgb(lin(k[j] / 255.0) * a) * 255) for j in range(3))
            key = (round(p[0], 5), round(p[1], 5), round(p[2], 5), qn, round(uv[0], 4), round(uv[1], 4), col)
            j = keys.get(key)
            if j is None:
                j = len(P); keys[key] = j; P.append(key[:3]); N.append(qn); UV.append((key[4], key[5])); C.append(col)
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
    if getattr(M, 'niv', None): d['niv'] = M.niv  # (the level that goes down: its axis, each stage's drop and scale — deco_comida.py)
    tol = 0.004
    if lo[0] < -spec['w'] / 2 - tol or hi[0] > spec['w'] / 2 + tol or lo[2] < -spec['d'] / 2 - tol or hi[2] > spec['d'] / 2 + tol or lo[1] < -tol:
        raise SystemExit(f"{spec['nome']} (lod {M.lod}): fora do seu retângulo — caixa {d['box']}, retângulo {spec['w']} × {spec['d']}")
    return d

def encode(M, s):
    # (the furniture's encoder — moveis.py — with the things' own checks: inside their box, their foot never under it; a thing on a
    # wall stands out of it toward +z only, a hung thing below its cord's end)
    d = encode_cor(M, dict(s, w=s['w'] + 0.004, d=s['d'] + 0.004))
    for k in ('civ', 'var'): d.pop(k, None)
    d['kind'] = s['kind']; d['w'] = s['w']; d['d'] = s['d']; d['h'] = s['h']; d['pousa'] = s['pousa']
    b = d['box']
    if b[4] > s['h'] + 0.004: raise SystemExit(f"{s['nome']} (lod {M.lod}): mais alto que a sua caixa — {b[4]:.3f} > {s['h']}")
    bad = [p for p in d['parts'] if p[0] not in PARTS]
    if bad: raise SystemExit(f"{s['nome']}: partes fora do vocabulário: {[p[0] for p in bad]}")
    lim = BUDGET['prato'] if s['kind'].startswith(SERVED) else BUDGET['grande'] if s['kind'] in BIG else BUDGET['coisa']
    if M.lod == 0 and d['t'] > lim: raise SystemExit(f"{s['nome']}: {d['t']} triângulos (orçamento {lim})")
    return d

def line(name, d): return f"  M[{json.dumps(name)}] = {json.dumps(d, separators=(',', ':'))};"

def read_old():
    if not os.path.exists(OUT): return {}
    old = {}
    for l in open(OUT, encoding='utf8'):
        m = re.match(r'  M\["([^"]+)"\] = ', l)
        if m: old[m.group(1)] = l.rstrip('\n')
    return old

def write(lines):
    body = '\n'.join(lines[k] for k in sorted(lines))
    js = ["'use strict';",
          "// decomesh: the small things the interiors show (the interiors 2.0, the front P5, D-740) — made in Blender by arte/blender/deco.py",
          "// (the shapes deco_coisas.py and deco_comida.py, on the furniture's moveis_forma.py) and written by it: do not edit by hand, make it",
          "// again. Each thing a G.MESH3D entry 'deco-<coisa>' — a dish 'comida-<prato>', a drink 'bebida-<bebida>' (D-748) — ('@1' its middle",
          "// level), in the format G.Mesh3D reads: metres, Y up, the front toward +Z, centred",
          "// on its box; the parts by what each is made of; the ambient light it gives itself in the vertex colours. Besides: its kind, its size,",
          "// how it rests (pousa: 'base' on its foot at y = 0, 'pende' hung from (0, h, 0), 'parede' flat on a wall at z = -d/2, 'canto' in a top",
          f"// corner), its anchors (anc: the flame of a lamp). {len(lines)} entries. Read by js/dentro3d.js (G.Dentro3D) only.",
          'window.G = window.G || {};',
          '(function (G) {',
          '  const M = G.MESH3D = G.MESH3D || {};',
          body,
          f"  G.DECO = {json.dumps({'v': 1, 'parts': PARTS, 'budget': BUDGET, 'big': sorted(BIG)}, separators=(',', ':'))};",
          '})(window.G);', '']
    with open(OUT, 'w', encoding='utf8') as f: f.write('\n'.join(js))
    return os.path.getsize(OUT)

def export(args):
    specs = [spec(r) for r in TABLE]
    if args:
        want = set(args); bad = want - {s['kind'] for s in specs}
        if bad: raise SystemExit(f'coisas desconhecidas: {sorted(bad)}')
        specs = [s for s in specs if s['kind'] in want]
    names = {nome(r[0]) for r in TABLE}
    old = read_old() if args else {}
    lines = {k: v for k, v in old.items() if k.split('@')[0] in names}
    rep = []
    for s in specs:
        t0 = None
        for lod in (0, 1):
            M = build(s, lod); d = encode(M, s); nm = s['nome'] + ('@1' if lod else '')
            if lod == 0: t0 = d['t']
            elif d['t'] > max(t0 * BUDGET['meio'], BUDGET['meioMin']): raise SystemExit(f"{nm}: o nível do meio com {d['t']} de {t0} triângulos")
            lines[nm] = line(nm, d); rep.append((nm, d['t'], len(lines[nm]) / 1024))
    size = write(lines)
    for nm, t, kb in rep: print(f'  {nm}: {t} triângulos, {kb:.1f} KB')
    print(f'decomesh.js: {len(lines)} entradas, {size / 1024:.0f} KB')

def count():
    old = read_old(); tot = 0
    for k in sorted(old):
        m = re.search(r'"t":(\d+)', old[k]); tot += len(old[k]); print(f'{k}: {m.group(1) if m else "?"} triângulos, {len(old[k]) / 1024:.1f} KB')
    print(f'{len(old)} entradas, {tot / 1024:.0f} KB')

def folha(out, lod):
    """every thing side by side on a floor, its name under it, by Cycles"""
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    MV.PC.COR.update(DCOR)
    specs = [spec(r) for r in TABLE]; x = 0.0; y = 0.0; rowh = 0.0; maxw = 3.2; placed = []
    for s in specs:
        if x + s['w'] > maxw: x = 0.0; y += rowh + 0.32; rowh = 0.0
        placed.append((x + s['w'] / 2, y + s['d'] / 2, s)); x += s['w'] + 0.22; rowh = max(rowh, s['d'])
    H = y + rowh
    for cx, cy, s in placed:
        M = build(s, lod); top = s['h']
        # (a hung thing drawn standing on the floor at its lowest point; a thing of a wall laid as it hangs)
        at = (cx - maxw / 2, 0, cy - H / 2)
        MV.to_blender(M, at=at, name=s['nome'])
        MV.label(s['kind'], cx - maxw / 2, -(cy - H / 2 + s['d'] / 2 + 0.1), size=0.05)
    MV.floor_plane(-maxw / 2 - 1, maxw / 2 + 1, -H / 2 - 1, H / 2 + 1)
    el = 38.0; sc = MV.scene_setup(2000, 1500, samples=28)
    MV.camera(sc, (0, 0.0, 0.22), 30, el, 0, maxw + 0.6)
    sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    print('folha →', out)

def shows(part, st):
    """whether a part shows at a stage of what was eaten (0 whole … 4 all gone) — the rule of js/dentro3d.js (D-748), the fresh head"""
    if part == 'nv': return st < 4
    m = re.match(r'^([bfnre]|cera)(\d)$', part)
    if not m: return part != 'vapor' or st == 0
    k, n = m.group(1), int(m.group(2))
    if k in 'bf': return st < n
    if k == 'n': return st == n
    if k == 'r': return st >= n
    if k == 'e': return st == 0 and n == 0
    return n == 0

def prev(out, kinds, lod=0):
    """the things asked, each at its stages 0, 2 and 4 side by side, in their own colours (the points' — the dish's —, the parts'
    of the sheet), by Cycles: nothing written"""
    import bpy
    bpy.ops.wm.read_factory_settings(use_empty=True)
    specs = [spec(r) for r in TABLE if r[0] in kinds]
    if len(specs) != len(kinds): raise SystemExit(f'coisas desconhecidas: {sorted(set(kinds) - {s["kind"] for s in specs})}')
    x = 0.0; row = []
    for s in specs:
        M = build(s, lod)
        for st in (0, 2, 4):
            cx = x + s['w'] / 2
            for pname, q in M.parts.items():
                if not q.T or not shows(pname, st): continue
                nv = getattr(M, 'niv', None) if pname == 'nv' else None; k = nv['k'][st] if nv else None
                at = (lambda p: (nv['c'][0] + (p[0] - nv['c'][0]) * k[1], p[1] + k[0], nv['c'][1] + (p[2] - nv['c'][1]) * k[1])) if nv else (lambda p: p)
                V = [(at(p)[0] + cx, -at(p)[2], at(p)[1]) for p in q.P]
                me = bpy.data.meshes.new(f'{s["nome"]}-{st}-{pname}'); me.from_pydata(V, [], [tuple(t) for t in q.T]); me.update()
                loops = []
                for t in q.T:
                    for i in t: n = q.N[i]; loops.append((n[0], -n[2], n[1]))
                for pg in me.polygons: pg.use_smooth = True
                me.normals_split_custom_set(loops)
                col = me.color_attributes.new('c', 'FLOAT_COLOR', 'CORNER'); K = q.__dict__.get('K') or []; base = DCOR.get(pname, (0.6, 0.5, 0.4)); k = 0
                for t in q.T:
                    for i in t:
                        kk = K[i] if i < len(K) else None; a = q.C[i]
                        c = tuple(lin(kk[j] / 255) * a for j in range(3)) if kk else tuple(base[j] * a for j in range(3))
                        col.data[k].color = (*c, 1.0); k += 1
                mat = bpy.data.materials.new(f'p-{pname}'); mat.use_nodes = True; nt = mat.node_tree; bsdf = nt.nodes.get('Principled BSDF')
                at = nt.nodes.new('ShaderNodeAttribute'); at.attribute_name = 'c'; nt.links.new(at.outputs['Color'], bsdf.inputs['Base Color'])
                bsdf.inputs['Roughness'].default_value = 0.35 if pname[0] in 'ne' or pname == 'resto' else 0.7
                if pname == 'vapor':
                    bsdf.inputs['Alpha'].default_value = 0.25
                me.materials.append(mat); ob = bpy.data.objects.new(me.name, me); bpy.context.scene.collection.objects.link(ob)
            row.append((cx, s['kind'] + f' {st}')); x += s['w'] + 0.06
        x += 0.1
    W = x
    MV.floor_plane(-0.3, W + 0.3, -0.6, 0.6)
    for cx, t in row: MV.label(t, cx, -0.2, size=0.022)
    sc = MV.scene_setup(2400, 700, samples=24)
    MV.camera(sc, (W / 2, 0.0, 0.03), 4, 40, 0, W + 0.1)
    sc.render.filepath = out; bpy.ops.render.render(write_still=True)
    print('prev →', out)

if __name__ == '__main__':
    a = sys.argv[1:]
    if '--' in a: a = a[a.index('--') + 1:]
    if a and a[0] == '--prev': prev(a[1], a[2:])
    elif a and a[0] == '--folha':
        lod = 0
        if '--lod' in a: i = a.index('--lod'); lod = int(a[i + 1]); a = a[:i] + a[i + 2:]
        folha(a[1], lod)
    elif a and a[0] == '--conta': count()
    else: export(a)
