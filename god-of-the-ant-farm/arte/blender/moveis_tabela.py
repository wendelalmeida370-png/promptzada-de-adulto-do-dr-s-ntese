# moveis_tabela: which model each people's piece is (the interiors 2.0, the front P2, D-710, D-711) — for each kind of the plan's
# catalogue that has models: its sizes (the plan's, w × d × h in metres: int-moveis.js and planos/interiores-2-contrato.md §4 —
# the same numbers the plan places, or the piece would not fit its rectangle), and its styles, each made by a builder and used by
# the peoples listed (the first gives the model its name; 'povo~var' is a variant of that people: ~rico, the rich house's). Every
# kind is someone's for each of the six peoples: no piece of a tavern falls back to the boxes. Three kinds are no piece of the
# plan's catalogue but parts the 3D adds: the amphora (anfora, what the rack shows), the flue over a hearth's hood (chamine), the
# leaf of a door (folha). arte/blender/moveis.py reads it; the game reads what it wrote (js/movelmesh.js: G.MOVEIS.alias).
from moveis_pecas import CIVS, PART_ORDER, COR, RUGO, banquinho, cadeira
from moveis_mesas import mesa_redonda, mesa_longa, banco
from moveis_bar import balcao, balcao_alvenaria, prateleira_bar, anforeira, anfora, barril, cuba, pipas
from moveis_fogo import lareira, chamine, forno_barro, fogao_comal, fogo_comprido
from moveis_quarto import estrado, lampadario, cama, arca
from moveis_porta import folha
from moveis_casa import mesa_terreiro, talha, jarros, fogao, lar, esteira

ALL = ['romano', 'classico', 'grego', 'egipcio', 'nordico', 'asteca']
TABLE = [
    # ---- the tavern's own (planos/interiores-2-contrato.md §4) ----
    ('banquinho', [(0.40, 0.40, 0.45)], {'romano': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'tripe': ['nordico'], 'asteca': ['asteca']}, banquinho),
    ('mesa-redonda', [(0.90, 0.90, 0.74)], {'delphica': ['romano', 'classico'], 'monopodio': ['romano~rico', 'classico~rico'], 'grego': ['grego'], 'papiro': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, mesa_redonda),
    ('mesa-taverna', [(1.60, 0.80, 0.74)], {'romano': ['romano', 'classico'], 'romano-rico': ['romano~rico', 'classico~rico', 'grego~rico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'cavalete': ['nordico'], 'asteca': ['asteca']}, mesa_longa),
    ('banco', [(1.40, 0.35, 0.45), (1.10, 0.35, 0.45)], {'tabuas': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'meio-tronco': ['nordico'], 'asteca': ['asteca']}, banco),
    ('cadeira', [(0.50, 0.50, 0.45)], {'catedra': ['romano', 'classico'], 'klismos': ['grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'icpalli': ['asteca']}, cadeira),
    ('balcao', [(1.80, 0.60, 1.00)], {'painel': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'tabuas': ['nordico'], 'asteca': ['asteca']}, balcao),
    ('balcao-alvenaria', [(2.40, 1.60, 1.00)], {'termopolio': ALL}, balcao_alvenaria),
    ('prateleira-bar', [(1.80, 0.40, 1.90)], {'estante': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, prateleira_bar),
    ('anforeira', [(1.20, 0.50, 1.10)], {'suporte': ['romano', 'classico', 'grego', 'egipcio', 'nordico'], 'asteca': ['asteca']}, anforeira),
    ('barril', [(0.60, 0.60, 0.90)], {'aduelado': ['romano', 'classico', 'grego', 'nordico'], 'jarra': ['egipcio', 'asteca']}, barril),
    ('lareira', [(1.40, 0.60, 1.20)], {'focus': ['romano', 'asteca'], 'chamine': ['classico', 'nordico'], 'eschara': ['grego', 'egipcio']}, lareira),
    ('forno-barro', [(1.00, 1.00, 1.10)], {'colmeia': ['egipcio', 'romano', 'classico', 'grego', 'nordico', 'asteca']}, forno_barro),
    ('fogao-comal', [(1.20, 0.70, 0.60)], {'tlecuilli': ['asteca', 'romano', 'classico', 'grego', 'egipcio', 'nordico']}, fogao_comal),
    ('fogo-comprido', [(3.00, 0.90, 0.30)], {'lareira-longa': ['nordico', 'romano', 'classico', 'grego', 'egipcio', 'asteca']}, fogo_comprido),
    ('estrado-musico', [(1.60, 1.20, 0.25)], {'tablado': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, estrado),
    # ---- the pieces of before the tavern uses (int-moveis.js, their sizes) ----
    ('mesa', [(1.10, 0.70, 0.75)], {'romano': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'cavalete': ['nordico'], 'asteca': ['asteca']}, mesa_longa),
    ('cuba', [(1.00, 1.00, 1.10)], {'aduelada': ['romano', 'classico', 'grego', 'nordico'], 'barro': ['egipcio', 'asteca']}, cuba),
    ('pipas', [(1.40, 0.80, 1.00)], {'berco': ['romano', 'classico', 'grego', 'nordico'], 'jarras': ['egipcio', 'asteca']}, pipas),
    ('lampadario', [(0.45, 0.45, 1.60)], {'candelabro': ['romano', 'classico', 'grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, lampadario),
    ('cama', [(0.90, 1.95, 0.50)], {'lectus': ['romano', 'classico', 'grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, cama),
    ('cama-casal', [(1.40, 1.95, 0.55)], {'lectus': ['romano', 'classico', 'grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, cama),
    ('arca', [(0.90, 0.50, 0.55)], {'romano': ['romano', 'classico'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'petlacalli': ['asteca']}, arca),
    # ---- what the tavern of today still has (the plan's pieces of before, int-moveis.js: also the houses') ----
    ('mesa-terreiro', [(2.20, 1.70, 0.75)], {'tabuas': ['romano', 'classico', 'egipcio'], 'grego': ['grego'], 'cavalete': ['nordico'], 'asteca': ['asteca']}, mesa_terreiro),
    ('talha', [(0.60, 0.60, 1.20)], {'pithos': ['romano', 'classico', 'grego', 'nordico'], 'zir': ['egipcio'], 'olla': ['asteca']}, talha),
    ('jarros', [(0.90, 0.50, 0.75)], {'tres': ALL}, jarros),
    ('fogao', [(1.20, 0.60, 0.90)], {'parede': ALL}, fogao),
    ('lar', [(0.80, 1.20, 0.25), (4.00, 1.00, 0.25)], {'pedras': ALL}, lar),
    ('esteira', [(0.72, 1.80, 0.06)], {'junco': ['romano', 'classico', 'grego', 'egipcio', 'asteca'], 'pele': ['nordico']}, esteira),
    ('esteira-casal', [(1.25, 1.85, 0.08)], {'junco': ['romano', 'classico', 'grego', 'egipcio', 'asteca'], 'pele': ['nordico']}, esteira),
    # ---- the parts the 3D adds ----
    ('anfora', [(0.30, 0.30, 1.00)], {'classica': ['romano', 'classico', 'grego', 'nordico'], 'egipcia': ['egipcio'], 'olla': ['asteca']}, anfora),
    ('chamine', [(0.50, 0.34, 1.00)], {'cano': ALL}, chamine),
    ('folha', [(1.00, 0.14, 2.00)], {'tabuas': ['classico'], 'romano': ['romano'], 'grego': ['grego'], 'egipcio': ['egipcio'], 'nordico': ['nordico'], 'asteca': ['asteca']}, folha),
]
# (the order of the kinds in the sheet of each people)
KINDS_SHEET = [t[0] for t in TABLE if t[0] not in ('chamine',)]

def cm(x): return str(int(round(x * 100)))

def specs():
    out = []
    for kind, sizes, styles, mk in TABLE:
        for style, users in styles.items():
            owner = users[0]; civ, _, var = owner.partition('~')
            for (w, d, h) in sizes:
                nome = f"movel-{kind}-{civ}{'~' + var if var else ''}-{cm(w)}x{cm(d)}x{cm(h)}"
                out.append({'nome': nome, 'kind': kind, 'civ': civ, 'var': var, 'style': style, 'w': w, 'd': d, 'h': h, 'fn': mk(style), 'users': users})
    return out

def alias():
    """for each kind, the people (and people~variant) that use a model named by another: {kind: {'grego~rico': 'romano~rico', ...}}"""
    out = {}
    for kind, sizes, styles, mk in TABLE:
        a = {}
        for style, users in styles.items():
            for u in users[1:]: a[u] = users[0]
        if a: out[kind] = a
    return out

def check():
    """the table's own proof: every kind a model for each of the six peoples, each people once"""
    bad = []
    for kind, sizes, styles, mk in TABLE:
        seen = [u for us in styles.values() for u in us if '~' not in u]
        for c in CIVS:
            if seen.count(c) != 1: bad.append(f'{kind}: o povo {c} tem {seen.count(c)} modelos')
    return bad
