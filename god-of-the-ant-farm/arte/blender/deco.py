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
# The shapes: arte/blender/deco_coisas.py (on the furniture's moveis_forma.py). The budget (D-745): the file ≤ 1 MB, each thing
# ≤ 700 triangles at its near level (the rug, the hanging, the cauldron, the firewood ≤ 1,400), its middle level ≤ 70 % of it
# (or ≤ 200). Nothing is drawn by chance: the same script, the same file, byte for byte.
import sys, os, re, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import moveis_forma as F
import moveis as MV
import deco_coisas as C

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'js', 'decomesh.js')
PARTS = ['louca', 'barro', 'tampa', 'madeira', 'madeira2', 'pano', 'pano2', 'corda', 'palha', 'saco', 'comida', 'conteudo', 'liquido', 'pao', 'carne',
         'peixe', 'alho', 'erva', 'milho', 'cabaca', 'queijo', 'lampada', 'cera', 'castical', 'panela', 'ferro', 'carvao', 'teia']
BIG = {'tapete', 'tapecaria', 'caldeirao', 'lenha'}
BUDGET = {'coisa': 700, 'grande': 1400, 'meio': 0.7, 'meioMin': 200}
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
    ('saco', 0.36, 0.32, 0.50, C.saco, 'base'), ('cesto', 0.32, 0.32, 0.33, C.cesto, 'base'), ('lenha', 0.62, 0.36, 0.32, C.lenha, 'base'),
    ('panela', 0.30, 0.26, 0.24, C.panela, 'base'), ('caldeirao', 0.62, 0.62, 0.80, C.caldeirao, 'base'),
    # ---- the light ----
    ('lamparina', 0.10, 0.16, 0.06, C.lamparina, 'base'), ('vela', 0.09, 0.09, 0.20, C.vela, 'base'),
    # ---- cloth ----
    ('pano-dobrado', 0.42, 0.32, 0.12, C.pano_dobrado, 'base'), ('tapete', 1.60, 1.00, 0.012, C.tapete, 'base'), ('tapecaria', 1.00, 0.06, 1.30, C.tapecaria, 'parede'),
    # ---- on the walls, in the corners ----
    ('cavilha', 0.03, 0.08, 0.03, C.cavilha, 'parede'), ('suporte', 0.2, 0.15, 0.15, C.suporte, 'parede'),
    ('rabisco-a', 0.30, 0.006, 0.14, C.rabisco('a'), 'parede'), ('rabisco-b', 0.28, 0.006, 0.22, C.rabisco('b'), 'parede'),
    ('rabisco-c', 0.16, 0.006, 0.20, C.rabisco('c'), 'parede'), ('rabisco-d', 0.26, 0.006, 0.14, C.rabisco('d'), 'parede'),
    ('teia', 0.30, 0.30, 0.30, C.teia, 'canto'),
]
# (the colours of the sheet's pictures — near what the game paints: js/dentro3d.js; linear, for Cycles)
DCOR = {'louca': (0.46, 0.18, 0.08), 'barro': (0.46, 0.18, 0.08), 'tampa': (0.30, 0.20, 0.12), 'madeira': (0.30, 0.17, 0.085), 'madeira2': (0.17, 0.095, 0.05),
        'pano': (0.62, 0.56, 0.45), 'pano2': (0.42, 0.14, 0.10), 'corda': (0.40, 0.30, 0.16), 'palha': (0.52, 0.40, 0.18), 'saco': (0.42, 0.34, 0.22),
        'comida': (0.62, 0.40, 0.18), 'conteudo': (0.55, 0.12, 0.08), 'liquido': (0.09, 0.04, 0.02), 'pao': (0.55, 0.30, 0.10), 'carne': (0.42, 0.12, 0.07),
        'peixe': (0.45, 0.38, 0.28), 'alho': (0.82, 0.78, 0.70), 'erva': (0.16, 0.30, 0.08), 'milho': (0.80, 0.52, 0.08), 'cabaca': (0.55, 0.40, 0.16),
        'queijo': (0.80, 0.62, 0.25), 'lampada': (0.46, 0.18, 0.08), 'cera': (0.85, 0.78, 0.58), 'castical': (0.30, 0.20, 0.10), 'panela': (0.06, 0.06, 0.06),
        'ferro': (0.05, 0.05, 0.048), 'carvao': (0.03, 0.03, 0.03), 'teia': (0.75, 0.75, 0.72)}

def spec(row):
    k, w, d, h, fn, pousa = row
    return {'kind': k, 'nome': 'deco-' + k, 'w': w, 'd': d, 'h': h, 'fn': fn, 'pousa': pousa, 'civ': '', 'var': ''}

def build(s, lod):
    M = F.Modelo(s['nome'], lod); s['fn'](M, s['w'], s['d'], s['h'])
    F.bake_ao(M, rays=16 if lod == 0 else 10, dist=0.2, floor=s['pousa'] == 'base')
    return M

def encode(M, s):
    # (the furniture's encoder — moveis.py — with the things' own checks: inside their box, their foot never under it; a thing on a
    # wall stands out of it toward +z only, a hung thing below its cord's end)
    d = MV.encode(M, dict(s, w=s['w'] + 0.004, d=s['d'] + 0.004))
    for k in ('civ', 'var'): d.pop(k, None)
    d['kind'] = s['kind']; d['w'] = s['w']; d['d'] = s['d']; d['h'] = s['h']; d['pousa'] = s['pousa']
    b = d['box']
    if b[4] > s['h'] + 0.004: raise SystemExit(f"{s['nome']} (lod {M.lod}): mais alto que a sua caixa — {b[4]:.3f} > {s['h']}")
    bad = [p for p in d['parts'] if p[0] not in PARTS]
    if bad: raise SystemExit(f"{s['nome']}: partes fora do vocabulário: {[p[0] for p in bad]}")
    lim = BUDGET['grande'] if s['kind'] in BIG else BUDGET['coisa']
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
          "// (the shapes deco_coisas.py, on the furniture's moveis_forma.py) and written by it: do not edit by hand, make it again. Each thing a",
          "// G.MESH3D entry 'deco-<coisa>' ('@1' its middle level), in the format G.Mesh3D reads: metres, Y up, the front toward +Z, centred",
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
    names = {'deco-' + r[0] for r in TABLE}
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

if __name__ == '__main__':
    a = sys.argv[1:]
    if '--' in a: a = a[a.index('--') + 1:]
    if a and a[0] == '--folha':
        lod = 0
        if '--lod' in a: i = a.index('--lod'); lod = int(a[i + 1]); a = a[:i] + a[i + 2:]
        folha(a[1], lod)
    elif a and a[0] == '--conta': count()
    else: export(a)
