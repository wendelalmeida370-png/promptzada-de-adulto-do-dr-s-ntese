# pilha: the texture stack of the 3D (js/tex3d.js) checked against the art bible (arte/BIBLIA.md §2.1, §6, §7), picture by
# picture, without a browser — what the game will multiply the world's colours by:
#   python3 qa/visual/pilha.py [PASTA_DO_JOGO] [ANTES_PASTA_DO_JOGO]    (the second: the materials new or changed since it)
# Each picture is the material's colour over its own mean, times 0.5, with its height in the alpha. So: the mean of each
# channel near 0.5 (128) — a hue the material brings would tint every wall of every people; joints and cracks never under
# ~0.35× the mean (no black), highlights at most 1.6×, no more than 2% of it past 2× the mean; height 0.12–1 (the stack puts
# the floor: under it the colour comes back black); 512 × 512 (or 256 for cloth); each ≤ 200 KB; all ≤ 6 MB.
# Exit 1 if a rule breaks (a FALHA line); AVISO lines are worth a look.
import sys, os, re, io, base64
from PIL import Image
ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', '..'))
OLD = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else None
ENTRY = re.compile(r"^\s*(\w+): \{ m: ([\d.]+), mean: \[([^\]]*)\], src: 'data:image/(\w+);base64,([A-Za-z0-9+/=]+)'", re.M)

def stack(root):
    src = open(os.path.join(root, 'js', 'tex3d.js'), encoding='utf8').read()
    return {m.group(1): (float(m.group(2)), [float(x) for x in m.group(3).split(',')], m.group(4), m.group(5)) for m in ENTRY.finditer(src)}

S = stack(ROOT); O = stack(OLD) if OLD else {}
fails, warns, rows = [], [], []
total = sum(len(v[3]) for v in S.values())  # (the budget is of base64: what the page carries)
for name, (metres, mean, kind, b64) in S.items():
    raw = base64.b64decode(b64); kb = len(raw) / 1024
    im = Image.open(io.BytesIO(raw)).convert('RGBA'); w, h = im.size
    px = list(im.get_flattened_data()) if hasattr(im, "get_flattened_data") else list(im.getdata()); n = w * h
    # (every fourth pixel is plenty for the rules; the means from all of them)
    sr = sg = sb = 0; amin, amax = 255, 0
    for k, (r, g, b, a) in enumerate(px):
        sr += r; sg += g; sb += b
        if a < amin: amin = a
        if a > amax: amax = a
    mr, mg, mb = sr / n, sg / n, sb / n; L0 = 0.2126 * mr + 0.7152 * mg + 0.0722 * mb
    dark = bright = hot = 0; m = 0
    for k in range(0, n, 4):
        r, g, b, a = px[k]; L = 0.2126 * r + 0.7152 * g + 0.0722 * b; m += 1
        if L < 0.35 * L0: dark += 1
        if L > 1.6 * L0: bright += 1
        if L > 2.0 * L0: hot += 1
    dark, bright, hot = dark / m * 100, bright / m * 100, hot / m * 100
    tint = max(abs(mr - 128), abs(mg - 128), abs(mb - 128))
    tag = '' if not O else ('novo' if name not in O else ('mudou' if O[name][3] != b64 else ''))
    rows.append((name, metres, f'{w}×{h}', round(kb), round(mr), round(mg), round(mb), round(dark, 1), round(bright, 1), round(hot, 1), round(amin / 255, 2), tag))
    who = f'{name}{" (" + tag + ")" if tag else ""}'
    if (w, h) not in ((512, 512), (256, 256)): fails.append(f'{who}: {w}×{h} (512×512, ou 256 para tecido)')
    if kb > 200: fails.append(f'{who}: {kb:.0f} KB (cada material ≤ 200 KB)')
    if hot > 2: fails.append(f'{who}: {hot:.1f}% da figura passa de 2× a média (≤ 2%)')
    if amin < 0.12 * 255 - 1: fails.append(f'{who}: altura mínima {amin / 255:.2f} no alfa (o piso é 0,12: abaixo, a cor volta preta)')
    if tint > 14: warns.append(f'{who}: a média puxa uma cor ({mr:.0f}, {mg:.0f}, {mb:.0f}; neutro é 128) — tinge todo povo que a usa')
    if dark > 1: warns.append(f'{who}: {dark:.1f}% abaixo de 0,35× a média (juntas e frestas pretas demais)')
    if bright > 4: warns.append(f'{who}: {bright:.1f}% acima de 1,6× a média (destaque demais)')
mb_total = total / 1048576
if mb_total > 6: fails.append(f"a pilha inteira tem {mb_total:.2f} MB de base64 (≤ 6 MB)")
nnew = sum(1 for r in rows if r[-1] == 'novo'); nchg = sum(1 for r in rows if r[-1] == 'mudou')
cmp = f' · comparada com {OLD}: {nnew} novos, {nchg} mudaram' if OLD else ''
print(f'PILHA DE TEXTURAS — {ROOT} · {len(S)} materiais, {mb_total:.2f} MB de base64 (orçamento 6){cmp}')
print(f'{"material":<14}{"m":>5}{"tamanho":>9}{"KB":>5}{"média R G B":>14}{"<0,35×":>8}{">1,6×":>7}{">2×":>6}{"alfa≥":>7}')
for r in rows: print(f'{r[0]:<14}{r[1]:>5}{r[2]:>9}{r[3]:>5}{r[4]:>6}{r[5]:>4}{r[6]:>4}{r[7]:>8}{r[8]:>7}{r[9]:>6}{r[10]:>7}  {r[11]}')
for f in fails: print('FALHA: ' + f)
for a in warns: print('AVISO: ' + a)
print(f'FALHOU: {len(fails)} (avisos {len(warns)})' if fails else f'PASSOU (avisos {len(warns)})')
sys.exit(1 if fails else 0)
