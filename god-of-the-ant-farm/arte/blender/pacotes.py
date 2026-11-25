# pacotes: how the libraries of the interiors' models are written (the interiors 3, the front X — the F8 of planos/interiores-3.md;
# D-1020 to D-1029): what arte/blender/moveis.py (the furniture) and arte/blender/deco.py (the decoration) share when they write a
# model. The 16-bit form (v 2, D-1021): a model's points as whole numbers of 16 bits over its own box (the box the file has always
# said, to a tenth of a millimetre: the points kept inside it), its normals in two bytes (octahedral: the code nearest the shape's own
# normal), its uv as whole numbers of 16 bits over their own box, the light a point gives itself in one grey byte (three where a point
# has its own colour: the dishes); the index, the parts and what the game reads to set a model down as they were. Half the bytes of
# the floats of before (v 1), and every model made is decoded again here and set beside the shape's own numbers before it is written:
# a point never more than a millimetre from where the shape put it, a normal never more than a degree — or nothing is written. The
# game reads it in js/mesh3d.js (G.Mesh3D: the one reader of G.MESH3D).
import base64, math, os, re
import numpy as np

Q16 = 65535
TOL = {'pos': 0.001, 'nor': 1.0, 'uv': 0.001}  # (the 16 bits' tolerance: a millimetre, a degree, a millimetre of the uv's metres)

def b64(a): return base64.b64encode(a.tobytes()).decode()

def _oct_dec(qx, qy):
    """a normal's two bytes back to the unit vector they stand for — the same sums as js/mesh3d.js"""
    x, y = qx / 127.0, qy / 127.0; z = 1.0 - abs(x) - abs(y)
    if z < 0: x, y = (1.0 - abs(y)) * (1.0 if x >= 0 else -1.0), (1.0 - abs(x)) * (1.0 if y >= 0 else -1.0)
    l = math.sqrt(x * x + y * y + z * z) or 1.0
    return (x / l, y / l, z / l)

def oct16(n):
    """a normal in two bytes: the octahedron's code of it, the nearest of its neighbours to the normal itself (Cigolle et al. 2014)"""
    x, y, z = n; l = abs(x) + abs(y) + abs(z)
    if l == 0: return (0, 0)
    x, y, z = x / l, y / l, z / l
    if z < 0: x, y = (1.0 - abs(y)) * (1.0 if x >= 0 else -1.0), (1.0 - abs(x)) * (1.0 if y >= 0 else -1.0)
    q0 = (int(round(x * 127)), int(round(y * 127))); m = math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2) or 1.0; u = (n[0] / m, n[1] / m, n[2] / m)
    best, bd = q0, -2.0
    for du in (-1, 0, 1):
        for dv in (-1, 0, 1):
            q = (max(-127, min(127, q0[0] + du)), max(-127, min(127, q0[1] + dv))); d = _oct_dec(*q); c = d[0] * u[0] + d[1] * u[1] + d[2] * u[2]
            if c > bd + 1e-12: bd, best = c, q
    return best

def _over(V, lo, hi):
    """values as whole numbers of 16 bits over [lo, hi] on each axis (an axis of no extent: all 0), kept inside it"""
    span = hi - lo; k = np.where(span > 0, Q16 / np.where(span > 0, span, 1.0), 0.0)
    return np.clip(np.rint((V - lo) * k), 0, Q16).astype('<u2')

def _back(Q, lo, hi): return lo + Q.astype(np.float64) * ((hi - lo) / Q16)

def form16(name, P, Nf, UV, C, I, parts):
    """a model's geometry in the 16-bit form: P its points (the shape's, to 5 decimals), Nf the shape's own normals, UV its uv (to 4
    decimals), C each point's colour (0–255), I the index, parts [[name, start, count]] — the dict's fields, checked against the shape
    (decoded again here: the points, the normals and the uv within the tolerance, or nothing is written)"""
    P = np.array(P, '<f4'); UV = np.array(UV, '<f4'); C = np.array(C, 'u1'); I = np.array(I); n = len(P)
    lo, hi = P.min(0), P.max(0); box = [round(float(v), 4) for v in list(lo) + list(hi)]
    blo, bhi = np.array(box[:3], np.float64), np.array(box[3:], np.float64)
    p16 = _over(P.astype(np.float64), blo, bhi)
    ul, uh = UV.min(0).astype(np.float64), UV.max(0).astype(np.float64); ub = [round(float(v), 5) for v in list(ul) + list(uh)]
    ulo, uhi = np.array(ub[:2], np.float64), np.array(ub[2:], np.float64); u16 = _over(UV.astype(np.float64), ulo, uhi)
    n8 = np.array([oct16(v) for v in Nf], '<i1').reshape(-1, 2)
    # (decoded again, as the game decodes it, beside the shape's own numbers)
    dp = np.abs(_back(p16, blo, bhi) - P.astype(np.float64)).max() if n else 0.0
    du = np.abs(_back(u16, ulo, uhi) - UV.astype(np.float64)).max() if n else 0.0
    dn = 0.0
    for (qx, qy), v in zip(n8.tolist(), Nf):
        m = math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2) or 1.0; d = _oct_dec(qx, qy)
        dn = max(dn, math.degrees(math.acos(max(-1.0, min(1.0, (d[0] * v[0] + d[1] * v[1] + d[2] * v[2]) / m)))))
    if dp > TOL['pos'] or dn > TOL['nor'] or du > TOL['uv']:
        raise SystemExit(f'{name}: a forma de 16 bits passa da tolerância — ponto {dp * 1000:.3f} mm, normal {dn:.3f}°, uv {du * 1000:.3f} mm')
    grey = bool(len(C) == 0 or ((C[:, 0] == C[:, 1]) & (C[:, 0] == C[:, 2])).all()); big = n > 65535
    d = {'v': 2, 'n': int(n), 't': int(len(I) // 3), 'box': box, 'p16': b64(p16), 'n8': b64(n8), 'idx': b64(I.astype('<u4' if big else '<u2')), 'i32': bool(big),
         'parts': parts, 'ub': ub, 'u16': b64(u16)}
    if grey: d['cg'] = b64(np.ascontiguousarray(C[:, 0]) if len(C) else C)
    else: d['col'] = b64(C)
    err = {'pos': float(dp), 'nor': float(dn), 'uv': float(du)}
    for k in WORST: WORST[k] = max(WORST[k], err[k])
    return d, (lo, hi), err

WORST = {'pos': 0.0, 'nor': 0.0, 'uv': 0.0}  # (the farthest of the 16 bits from the shapes, of the models written in this run)
def worst(): return f"os 16 bits: o ponto mais longe a {WORST['pos'] * 1000:.3f} mm da forma, a normal a {WORST['nor']:.3f}°, o uv a {WORST['uv'] * 1000:.3f} mm"

# ------------------------------ the packs (D-1020) ------------------------------
# A library is an index the page loads — js/movelmesh.js, js/decomesh.js — and its packs, a file a family: js/movelmesh-<família>.js,
# js/decomesh-<família>.js, asked for by the game when a piece of the family is drawn (js/movel3d.js; never by index.html). THE RULE:
# a model is in the pack of the family of what it is for —
#   · 'base': what the shell and the street draw at first sight — the leaf of a door (the shell of an inside open), the pieces of a
#     yard (drawn into the street's own picture, which a pack that comes later does not make again) —: in the index itself, never
#     waiting for a pack. The pieces of a yard only until the street's chunk carries what its yard's packs are (G.Movel3D.yardSig in
#     Build3D.shellSig — the line for the supervisor, D-1027): with it, a yard's piece goes to the family of its building, by its
#     TIPOS, as an inside's does, and the base keeps the leaf alone (a kind of a yard is ≈ 76 KB of the index, whose budget holds
#     three or four more: the potter's yard has six pieces, none of them modelled yet — the proof p12 of qa/visual/pacotes.js);
#   · 'comum': what every inside has — to sit, to set down, to keep, to light; the vessels, the cups and the food of a shelf, the cloth,
#     the pegs, the years' marks —: the pack every inside asks for, asked a few seconds after the page opens (CEDO);
#   · 'casa': to sleep and to cook at home — the houses, and the rooms of whoever lives in a building (the seat, the tavern's inn);
#   · 'mesa' (the decoration): what is served at a table and held in the hands — the dishes by their part of the food, the drinks in
#     their cups (D-748): the tavern's today, the palace's banquet tomorrow;
#   · 'taverna': the tavern's own — the bar and the brew, the hall's tables, the musician's stage, the hearths made for it, the marks
#     of its nights, the boards at its door, the feast, the door barred or broken in, the games;
#   · and, as the waves come, a family for each kind of work (the court of a palace, the rite of a temple, the craft of a workshop, the
#     cells of the law, the port, the trade): the front that models its pieces says their family here, a line a kind — and the types
#     of building that draw the family (TIPOS): a world that has one asks for it as it opens (D-1025).
# A kind no line names goes to 'comum' (the pack every inside asks for: drawn right wherever it is put, if not cheaply) and the
# generators say so. A pack holds shapes only: what each part of a piece is made of is still what its people has (js/movel3d.js —
# Movel3D.paint, by G.Origem.matOK —; the decoration's by G.Atmos.within), never the pack's: nada vem do nada. A building asks for
# few packs — the common, the house's where people live in it, its own: the proof qa/visual/pacotes.js counts them, type by type. A
# model is in one pack only; a pack is its family's whole. A family that grows past its budget (BUDGET['arquivo']) is split by the
# front that makes it grow — two families here —, never a model in two packs.
FAMILIA = {
    'base': 'what the shell and the street draw at first sight — the leaf of a door, the pieces of a yard: never waiting for a pack',
    'comum': "every inside's: to sit, to set down, to keep, to light — the pack every inside asks for",
    'casa': 'to sleep and to cook at home: the houses, and the rooms of whoever lives in a building (the seat, the inn)',
    'mesa': 'what is served at a table and held in the hands: the dishes by their part of the food, the drinks in their cups (D-748)',
    'taverna': "the tavern's own: the bar and the brew, the hall's tables, the musician, its hearths, its nights, its door, its feast, its games",
}
CEDO = {'movel': ['comum', 'casa'], 'deco': ['comum']}  # (asked a few seconds after the page opens: every inside asks for them)
# The types of building whose insides draw a family that is not early (D-1025): a world opened with a building of one of them asks for
# the family's pack at once, in the background — before the body comes near one, so the first of them it walks into is drawn by its
# models, never by the boxes. The front that makes a family says its types here, with the family (the proof p10 of
# qa/visual/pacotes.js: every family a building of the ready worlds draws is early or has the building's type here)
TIPOS = {'movel': {'taverna': ['taverna']}, 'deco': {'mesa': ['taverna'], 'taverna': ['taverna']}}
MOVEL = {
    # (the shell and the street)
    'folha': 'base', 'mesa-terreiro': 'base',
    # (every inside's: the seats, the tables, the chest, the light, the flue over a hood, the counter of a shop, the casks of a store,
    # the jars that keep)
    'banquinho': 'comum', 'banco': 'comum', 'cadeira': 'comum', 'mesa': 'comum', 'arca': 'comum', 'lampadario': 'comum', 'chamine': 'comum',
    'balcao': 'comum', 'barril': 'comum', 'pipas': 'comum', 'talha': 'comum', 'jarros': 'comum',
    # (to sleep and to cook at home)
    'cama': 'casa', 'cama-casal': 'casa', 'esteira': 'casa', 'esteira-casal': 'casa', 'lar': 'casa', 'fogao': 'casa',
    # (the tavern's own)
    'mesa-redonda': 'taverna', 'mesa-taverna': 'taverna', 'balcao-alvenaria': 'taverna', 'prateleira-bar': 'taverna', 'anforeira': 'taverna', 'anfora': 'taverna',
    'cuba': 'taverna', 'estrado-musico': 'taverna', 'lareira': 'taverna', 'forno-barro': 'taverna', 'fogao-comal': 'taverna', 'fogo-comprido': 'taverna',
}
DECO = {
    # (every inside's: the vessels of the drink and of the oil, the cups, the bowls and the plates of a shelf and of a family's table,
    # the bread, the food hung, the sacks, the baskets, the firewood, the pots on the fire, the lamps and the candles, the cloth, the
    # pegs and the lamp's shelf, the cobwebs, the marks of charcoal of the years)
    'jarra': 'comum', 'jarra-alta': 'comum', 'anforeta': 'comum', 'pote': 'comum', 'cabaca': 'comum', 'jarro-madeira': 'comum',
    'caneca': 'comum', 'taca': 'comum', 'copo': 'comum', 'caneca-madeira': 'comum', 'tigela': 'comum', 'prato': 'comum', 'prato-peixe': 'comum',
    'pao': 'comum', 'tortilhas': 'comum', 'queijo': 'comum', 'presunto': 'comum', 'peixe-seco': 'comum', 'alho': 'comum', 'ervas': 'comum', 'milho': 'comum',
    'saco': 'comum', 'cesto': 'comum', 'lenha': 'comum', 'panela': 'comum', 'caldeirao': 'comum', 'lamparina': 'comum', 'vela': 'comum',
    'pano-dobrado': 'comum', 'tapete': 'comum', 'tapecaria': 'comum', 'cavilha': 'comum', 'suporte': 'comum', 'teia': 'comum',
    'rabisco-a': 'comum', 'rabisco-b': 'comum', 'rabisco-c': 'comum', 'rabisco-d': 'comum',
    # (the tavern's own: the marks of its nights, the boards at its door, the keeper's cloth, the feast, the door, the games — and, by
    # their names below, the feast's platters and the standards of each people)
    'mancha-a': 'taverna', 'mancha-b': 'taverna', 'mancha-c': 'taverna', 'mancha-d': 'taverna', 'ossos': 'taverna', 'cacos': 'taverna', 'caneca-caida': 'taverna',
    'poca': 'taverna', 'lousa': 'taverna', 'quadro': 'taverna', 'placa': 'taverna', 'pano-ombro': 'taverna', 'guirlanda-flores': 'taverna', 'guirlanda-horta': 'taverna',
    'bandeirolas': 'taverna', 'pano-festa': 'taverna', 'petalas': 'taverna', 'tranca': 'taverna', 'porta-caida': 'taverna', 'lascas': 'taverna',
    'dado': 'taverna', 'copo-dados': 'taverna', 'cartas': 'taverna', 'monte': 'taverna',
}
def familia(lib, kind):
    """the family a kind's models are in (lib 'movel' or 'deco'), and whether a line of this module said it"""
    if lib == 'movel': return (MOVEL[kind], True) if kind in MOVEL else ('comum', False)
    if kind.startswith('comida-festa-') or kind.startswith('estandarte-'): return 'taverna', True
    if kind.startswith('comida-') or kind.startswith('bebida-'): return 'mesa', True
    return (DECO[kind], True) if kind in DECO else ('comum', False)

KIND = re.compile(r'"kind":"([^"]+)"')
def mib(t): return len(t.encode('utf8')) / 1048576

def files(lib, lines, index_text, pack_text, budget):
    """the texts of a library's files, {file name: text}: its index (lib.js — the index and the base's models) and a pack a family
    (lib-<família>.js); lines {model name: its line}. Each file in its budget (MiB): the index BUDGET['indice'], a pack 'arquivo',
    all of them 'todos' — or nothing is written"""
    ln = LIBNAME[lib]; groups, loose, of = {}, set(), {}
    for fam in list(CEDO[ln]) + list(TIPOS[ln]):
        if fam not in FAMILIA: raise SystemExit(f'arte/blender/pacotes.py: a família «{fam}» (CEDO ou TIPOS de {ln}) não é uma das FAMILIA')
        if fam in CEDO[ln] and fam in TIPOS[ln]: raise SystemExit(f'arte/blender/pacotes.py: a família «{fam}» de {ln} é cedo e tem tipos — uma coisa ou a outra')
    for name in sorted(lines):
        k = KIND.search(lines[name]).group(1); fam, said = familia(ln, k)
        if not said: loose.add(k)
        groups.setdefault(fam, {})[name] = lines[name]; of[k] = fam
    out, meta = {}, {}
    for fam in sorted(f for f in groups if f != 'base'):
        t = pack_text(fam, groups[fam]); out[f'{lib}-{fam}.js'] = t
        meta[fam] = {'f': f'js/{lib}-{fam}.js', 'n': len(groups[fam]), 'kb': round(len(t.encode('utf8')) / 1024)}
        if fam in CEDO[ln]: meta[fam]['cedo'] = 1
        elif fam in TIPOS[ln]: meta[fam]['tipos'] = sorted(TIPOS[ln][fam])
    out[f'{lib}.js'] = index_text(groups.get('base', {}), {k: of[k] for k in sorted(of)}, meta)
    for f, t in out.items():
        idx = f == f'{lib}.js'; lim = budget['indice'] if idx else budget['arquivo']
        if mib(t) > lim and idx: raise SystemExit(f'js/{f}: {mib(t):.2f} MiB, passa do orçamento do índice ({lim} MiB) — a base é só a folha da porta e as peças de quintal: com a linha do D-1027 no Build3D.shellSig (o G.Movel3D.yardSig), ponha as peças de quintal na família do seu prédio (MOVEL e TIPOS, no arte/blender/pacotes.py)')
        if mib(t) > lim: raise SystemExit(f'js/{f}: {mib(t):.2f} MiB, passa do orçamento ({lim} MiB) — divida a família em duas no arte/blender/pacotes.py')
    if sum(mib(t) for t in out.values()) > budget['todos']: raise SystemExit(f"a biblioteca {lib} passa de {budget['todos']} MiB")
    return out, sorted(loose)

LIBNAME = {'movelmesh': 'movel', 'decomesh': 'deco'}

def write(js_dir, lib, out):
    """the library's files written, and a pack of a family that is no more taken away; their sizes"""
    for f, t in out.items():
        with open(os.path.join(js_dir, f), 'w', encoding='utf8') as h: h.write(t)
    for f in os.listdir(js_dir):
        if re.match(rf'^{lib}-[\w-]+\.js$', f) and f not in out: os.remove(os.path.join(js_dir, f))
    return {f: os.path.getsize(os.path.join(js_dir, f)) for f in sorted(out)}

def read(js_dir, lib):
    """every model line of a library's files (the index and the packs): {name: line}"""
    old = {}
    for f in sorted(os.listdir(js_dir)):
        if f != f'{lib}.js' and not re.match(rf'^{lib}-[\w-]+\.js$', f): continue
        for l in open(os.path.join(js_dir, f), encoding='utf8'):
            m = re.match(r'  M\["([^"]+)"\] = ', l)
            if m: old[m.group(1)] = l.rstrip('\n')
    return old

def confere(js_dir, lib, out):
    """the library's files set beside what the generator makes today (nothing written): the names of those that differ, or are there
    and should not be, or should be and are not"""
    bad = []
    for f, t in out.items():
        p = os.path.join(js_dir, f)
        if not os.path.exists(p): bad.append(f'{f}: falta'); continue
        if open(p, encoding='utf8').read() != t: bad.append(f'{f}: outro')
    for f in sorted(os.listdir(js_dir)):
        if re.match(rf'^{lib}-[\w-]+\.js$', f) and f not in out: bad.append(f'{f}: um pacote que o gerador não faz')
    return bad
