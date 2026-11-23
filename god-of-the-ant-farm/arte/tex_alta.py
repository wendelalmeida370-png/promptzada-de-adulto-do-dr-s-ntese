# tex_alta: the insides' materials in high resolution — the front P8 of the interiors 2.0 (D-770 to D-779). Photographs of
# Poly Haven (CC0: the colour, the normal of the relief and the roughness, at 2K) and, where no photograph fits (the Roman
# mosaic, the painted frieze, the reed mat, the rug), the pictures of arte/mat_dentro.py made again at 1024 — each one
# neutralized as the stack's are (arte/texturas.py, BIBLIA §2.1): no light painted in, its brightness over its own mean (the
# world's colour, the people's, multiplies it), its hue near the neutral, its joints never black, repeating without a seam.
# What the game reads (js/ground3d.js, G.Ground3D.hi*): per material a colour picture (the ratio over the mean, ×0.5, in
# gamma 2.2, WebP) and a grey one with three squares side by side — the normal's x and y (the picture's rows downward, as
# the 3D reads them) and the roughness. The Alta and the Ultra load them in the background (js/tex3d-alta-<nome>.js, by a
# script tag the loader adds: never at the start, never on the Média, the Leve or the phone).
#   python3 arte/tex_alta.py [--raw PASTA] [--prev PASTA] [nome ...]
# --raw: where the downloads are kept (out of the repository; default $PH_RAW or /tmp/gotaf-polyhaven); --prev: the
# pictures as made, to look at; names: only those data files made again (the manifest always). The list of the photographs,
# with their authors and the address of each file, is written into arte/LICENCAS.md between its two marks.
import sys, os, io, json, base64, hashlib, urllib.request
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = 'https://api.polyhaven.com'
BUDGET = 40e6       # (bytes of base64 for all the data files: the owner's «uns 40 MB a mais», D-770)
FILE_MAX = 15e6     # (each file: the artifact's limit)

# ------------------------------------------------------------------ the materials
# (name, tier, source, metres across, metres up, options)
# tier 1: 2048 on the Ultra, 1024 on the Alta (the floors, the walls, the furniture's wood: what the eye meets first); tier 2:
# half that (the stone, the clay, the mosaic, the frieze, the mat, the rug). source: ('ph', asset) or ('proc', maker).
# pats: the patterns of Build3D.PAT it draws (the stack's 512 draws every other one, and these too until they are in).
# options: rot — quarter turns counterclockwise (a floor's boards along the picture's width, a wood's grain up it); con —
# contrast of the brightness (in log); chroma — how much of the photograph's own hue stays (BIBLIA: ±5%); flat — how much
# of the light painted in at large scale is taken out (and with it the big stain that betrays a repeat); ao — how much of
# the photograph's cavity darkens the brightness; nk — the relief's strength; rk, rb — the roughness scaled and moved;
# anti — the shader breaks the repeat by blending two shifted reads (only where there is no grid: plaster, earth, clay);
# turn — the pattern names that read the picture turned a quarter (a plank lying, as plankH); movel — the material a piece of
# furniture reads in its place (the hewn beam is the roof's: a chair's arm is planed)
MATS = [
    ('caiado', 1, ('ph', 'painted_plaster_wall'), 2.0, 2.0, dict(pats=['caiado', 'plaster', 'whitewash', 'stucco', 'frame'], con=0.9, chroma=0.3, flat=0.85, ao=0.6, nk=1.1, rk=1.0, rb=0.05, anti=1)),
    ('tabuado', 1, ('ph', 'wood_planks'), 1.5, 1.5, dict(pats=['tabuado'], con=1.0, chroma=0.35, flat=0.7, ao=0.8, nk=1.3, rk=0.9, rb=0.0)),
    ('terra', 1, ('ph', 'clay_floor_001'), 2.0, 2.0, dict(pats=['terra'], con=1.0, chroma=0.3, flat=0.8, ao=0.7, nk=1.1, rk=1.0, rb=0.08, anti=1)),
    ('lajota', 1, ('ph', 'terracotta_floor_tiles'), 2.7, 2.7, dict(pats=['lajota'], con=0.95, chroma=0.55, flat=0.85, ao=0.8, nk=1.3, rk=1.0, rb=0.0)),
    ('lajes', 1, ('ph', 'floor_tiles_04'), 2.6, 2.6, dict(pats=['lajes'], con=1.05, chroma=0.3, flat=0.8, ao=0.8, nk=1.3, rk=0.9, rb=0.0)),
    ('madeira', 1, ('ph', 'oak_veneer_01'), 1.83, 1.83, dict(pats=['jamb', 'jambX', 'jambZ', 'madeira', 'madeira2'], con=1.0, chroma=0.35, flat=0.6, ao=0.6, nk=1.0, rc=0.35, rk=1.0, rb=0.0)),
    ('viga', 1, ('ph', 'rough_wood'), 0.5, 1.0, dict(pats=['beam', 'beamX', 'beamZ'], movel='madeira', con=1.0, chroma=0.3, flat=0.6, ao=0.8, nk=1.3, rk=1.0, rb=0.05)),
    ('tabuas', 1, ('ph', 'weathered_planks'), 2.0, 2.0, dict(pats=['plankV', 'plankH'], turn=['plankH'], con=1.0, chroma=0.3, flat=0.7, ao=0.8, nk=1.3, rk=1.0, rb=0.0)),
    ('pedra', 2, ('ph', 'castle_wall_varriation'), 2.0, 2.0, dict(pats=['stone', 'ashlar', 'sandstone'], con=1.0, chroma=0.35, flat=0.7, ao=0.8, nk=1.3, rk=1.0, rb=0.0)),
    ('barro', 2, ('ph', 'clay_plaster'), 2.0, 2.0, dict(pats=['mud', 'barro'], con=1.0, chroma=0.3, flat=0.85, ao=0.6, nk=1.1, rk=1.0, rb=0.0, anti=1)),
    ('mosaico', 2, ('proc', 'mosaico'), 1.2, 1.2, dict(pats=['mosaico'], nk=0.15, chroma=1.0)),
    ('friso', 2, ('proc', 'friso'), 1.2, 1.2, dict(pats=['friso'], nk=0.3, chroma=1.0)),
    ('esteira', 2, ('proc', 'esteira'), 1.2, 1.2, dict(pats=['esteira'], nk=0.25, chroma=1.0)),
    ('tapete', 2, ('proc', 'tapete'), 1.6, 1.6, dict(pats=['tapete'], nk=0.3, chroma=1.0)),
]
SIZE = {1: 2048, 2: 1024}

# ------------------------------------------------------------------ the downloads (kept out of the repository)
def raw_dir():
    for i, a in enumerate(sys.argv):
        if a == '--raw' and i + 1 < len(sys.argv): return sys.argv[i + 1]
    return os.environ.get('PH_RAW') or '/tmp/gotaf-polyhaven'

UA = {'User-Agent': 'gotaf-tex-alta/1'}   # (the API refuses a request with no name: a plain one, nothing of whoever runs it)
def get(url, f=None):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r: b = r.read()
    if f: open(f, 'wb').write(b)
    return b

def fetch_json(url, cache):
    if os.path.exists(cache): return json.load(open(cache))
    d = json.loads(get(url).decode()); json.dump(d, open(cache, 'w')); return d

MAPS = {'diff': 'Diffuse', 'nor_gl': 'nor_gl', 'rough': 'Rough', 'ao': 'AO'}
def asset(aid):
    """the asset's info (its name, its authors) and its four maps at 2K, downloaded once and checked by their md5"""
    d = os.path.join(raw_dir(), aid); os.makedirs(d, exist_ok=True)
    info = fetch_json(f'{API}/info/{aid}', os.path.join(d, 'info.json'))
    files = fetch_json(f'{API}/files/{aid}', os.path.join(d, 'files.json'))
    out = {'info': info, 'urls': {}}
    for k, key in MAPS.items():
        e = files[key]['2k']['jpg']; f = os.path.join(d, os.path.basename(e['url']))
        if not os.path.exists(f) or hashlib.md5(open(f, 'rb').read()).hexdigest() != e['md5']:
            print(f'  baixando {os.path.basename(f)}'); get(e['url'], f)
            if hashlib.md5(open(f, 'rb').read()).hexdigest() != e['md5']: raise SystemExit(f'{aid}: md5 errado em {f}')
        out[k] = f; out['urls'][k] = e['url']
    return out

# ------------------------------------------------------------------ the tools (everything periodic: the pictures repeat)
W3 = np.array([0.2126, 0.7152, 0.0722], np.float32)
def srgb2lin(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4).astype(np.float32)
def load(f, mode='RGB'): return np.asarray(Image.open(f).convert(mode), np.float32) / 255.0

def gauss(a, sigma):
    """a periodic Gaussian blur (by the Fourier transform: the edges wrap round, as the picture does)"""
    H, W = a.shape[:2]; fy = np.fft.fftfreq(H)[:, None]; fx = np.fft.fftfreq(W)[None, :]
    k = np.exp(-2 * (np.pi ** 2) * (sigma ** 2) * (fx * fx + fy * fy))
    if a.ndim == 2: return np.real(np.fft.ifft2(np.fft.fft2(a) * k)).astype(np.float32)
    return np.stack([gauss(a[..., c], sigma) for c in range(a.shape[2])], -1)

def resize(a, n):
    if a.shape[0] == n: return a
    if a.ndim == 2: return np.asarray(Image.fromarray(a.astype(np.float32), 'F').resize((n, n), Image.LANCZOS), np.float32)
    return np.stack([resize(a[..., c], n) for c in range(a.shape[2])], -1)

def rot(a, k):
    return np.rot90(a, k).copy() if k else a

def rot_normal(n, k):
    """the normal's (x right, y up the picture) turned with the picture, k quarter turns counterclockwise"""
    n = rot(n, k)
    for _ in range(k % 4): n = np.stack([-n[..., 1], n[..., 0], n[..., 2]], -1)
    return n

def soft_range(L, lo=0.35, hi=1.6):
    """the brightness over its mean kept between the joints' floor and the highlights' ceiling, softly (BIBLIA §2.1)"""
    up = hi - (hi - 1) * np.exp(-(L - 1) / (hi - 1)); dn = lo + (1 - lo) * np.exp((L - 1) / (1 - lo))
    return np.where(L > 1, up, dn).astype(np.float32)

def neutral(lin, o, ao=None):
    """a photograph's colour as the game wants it: the large light taken out, the brightness over its mean, the contrast and
    the hue calmed, the cavities a little darker; returns the linear ratio (1 on average), RGB"""
    S = lin.shape[0]; L = np.maximum(lin @ W3, 1e-4)
    low = gauss(L, S / 6.0); Lf = L / (low / low.mean()) ** o.get('flat', 0.7)
    Lr = Lf / Lf.mean(); Lr = np.exp(np.log(np.maximum(Lr, 1e-3)) * o.get('con', 1.0))
    if ao is not None: Lr = Lr * (1 - o.get('ao', 0.5) * (1 - ao))
    # (a photograph's darkest are its joints and gaps: kept off black; a drawing's — the mosaic's basalt, the rug's dye — are its own)
    if o.get('range', True): Lr = soft_range(Lr / Lr.mean())
    Lr = Lr / Lr.mean()
    ch = lin / L[..., None]; cm = (lin.reshape(-1, 3).mean(0) / L.mean()); ch = ch / cm
    ch = 1 + (ch - 1) * o.get('chroma', 0.3); ch = ch / (ch @ W3)[..., None]
    return np.clip(Lr[..., None] * ch, 0, 2.0)

def normal_from_height(h, k):
    """the relief's normal from a height (0..1 over the picture), k its steepness — 0.03 × pixels a metre: the height's 0..1 is 3 cm,
    as the stack's relief is (Build3D: bump = slope × 0.03) —: (x right, y up the picture, z out)"""
    S = h.shape[0]; dx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * S; dy = (np.roll(h, 1, 0) - np.roll(h, -1, 0)) * 0.5 * S
    n = np.stack([-dx * k, -dy * k, np.ones_like(h)], -1); return n / np.linalg.norm(n, axis=-1, keepdims=True)

# ------------------------------------------------------------------ the makers
def photo(name, aid, o, S):
    a = asset(aid); k = o.get('rot', 0)
    lin = rot(srgb2lin(load(a['diff'])), k); ao = rot(load(a['ao'], 'L'), k)
    col = neutral(lin, o, ao)
    n = load(a['nor_gl']) * 2 - 1; n = rot_normal(n, k)
    rough = rot(load(a['rough'], 'L'), k)
    col, n, rough = resize(col, S), resize(n, S), resize(rough, S)
    return col, n, rough, a

def procedural(name, maker, o, S, metres):
    import mat_dentro as MD
    MD.S = S; col, h = getattr(MD, maker)(); MD.S = 512
    col = np.clip(col, 0, 1).astype(np.float32); h = np.clip(h, 0, 1).astype(np.float32)
    lin = col ** 2.2; col = neutral(lin, dict(flat=0.0, con=1.0, chroma=o.get('chroma', 1.0), range=False))
    n = normal_from_height(gauss(h, 1.2 * S / 512), 0.03 * S / metres * o.get('nk', 1.0))
    rough = ROUGH[maker](h, col)
    return col, n, rough, None

# (the roughness of the pictures made here: by what each part is)
ROUGH = {
    'mosaico': lambda h, c: np.clip(0.95 - (h - 0.25) / 0.55 * 0.45, 0.4, 0.95),     # (the cubes worn smooth, the grout rough)
    'friso': lambda h, c: np.full(h.shape, 0.85, np.float32),
    'esteira': lambda h, c: np.clip(0.9 - h * 0.25, 0.6, 0.95),
    'tapete': lambda h, c: np.full(h.shape, 0.97, np.float32),
}

def make(m):
    name, tier, src, mu, mv, o = m; S = SIZE[tier]
    if src[0] == 'ph': col, n, rough, a = photo(name, src[1], o, S)
    else: col, n, rough, a = procedural(name, src[1], o, S, mu)
    # (the relief's strength, then down the rows: the 3D reads a picture's rows downward, the normal's y with them)
    nk = o.get('nk', 1.0) if src[0] == 'ph' else 1.0
    n = n.copy(); n[..., :2] *= nk; n = n / np.linalg.norm(n, axis=-1, keepdims=True)
    rm = float(rough.mean()); rough = rm + (rough - rm) * o.get('rc', 1.0)   # (rc: a photograph's roughness calmed round its mean)
    rough = np.clip(rough * o.get('rk', 1.0) + o.get('rb', 0.0), 0.04, 1.0)
    return col, n, rough, a

def encode(col, n, rough, q=(86, 88)):
    """the two pictures the game reads: the colour (the ratio ×0.5 in gamma 2.2) and the grey strip — nx | ny (down) | rough"""
    S = col.shape[0]
    c8 = (np.clip(col ** (1 / 2.2) * 0.5, 0, 1) * 255 + 0.5).astype(np.uint8)
    g = np.concatenate([n[..., 0] * 0.5 + 0.5, -n[..., 1] * 0.5 + 0.5, rough], 1)
    g8 = (np.clip(g, 0, 1) * 255 + 0.5).astype(np.uint8)
    bc = io.BytesIO(); Image.fromarray(c8, 'RGB').save(bc, 'WEBP', quality=q[0], method=6)
    bg = io.BytesIO(); Image.fromarray(g8, 'L').save(bg, 'WEBP', quality=q[1], method=6)
    return base64.b64encode(bc.getvalue()).decode(), base64.b64encode(bg.getvalue()).decode()

# ------------------------------------------------------------------ the files
def manifest():
    mats = []
    for name, tier, src, mu, mv, o in MATS:
        mats.append({'n': name, 't': tier, 'm': [mu, mv], 'pats': o['pats'], 'turn': o.get('turn', []), 'anti': o.get('anti', 0), 'movel': o.get('movel'),
                     'src': src[1] if src[0] == 'ph' else None, 'f': 'js/tex3d-alta-' + name + '.js'})
    js = ["'use strict';", '// tex3d-alta: the insides\' materials in high resolution, made by arte/tex_alta.py — do not edit by hand (run it again).',
          '// what there is and where: each material\'s tier (1: 2048 on the Ultra, 1024 on the Alta; 2: half), the metres its picture covers',
          '// (across, up), the patterns it draws (Build3D.PAT), the ones that read it turned, whether the shader breaks its repeat, the',
          '// photograph it came from (arte/LICENCAS.md) and its data file — loaded by G.Ground3D only on the Alta and the Ultra (D-770)',
          '(function (G) {', '  G.TEX3DA = { v: 1, mats: ' + json.dumps(mats, ensure_ascii=False) + ', data: {} };', '})(window.G);', '']
    open(os.path.join(ROOT, 'js', 'tex3d-alta.js'), 'w').write('\n'.join(js))

def write_data(name, c64, g64):
    js = ["'use strict';", f'// tex3d-alta-{name}: one material of the insides in high resolution (arte/tex_alta.py — do not edit by hand)',
          '(function (G) {', f"  const T = G.TEX3DA; if (!T) return; T.data[{json.dumps(name)}] = {{ c: 'data:image/webp;base64,{c64}', g: 'data:image/webp;base64,{g64}' }};",
          f'  if (T.got) T.got({json.dumps(name)});', '})(window.G);', '']
    f = os.path.join(ROOT, 'js', f'tex3d-alta-{name}.js'); open(f, 'w').write('\n'.join(js)); return os.path.getsize(f)

def licences(rows):
    """the photographs' lines in arte/LICENCAS.md, between its two marks"""
    f = os.path.join(ROOT, 'arte', 'LICENCAS.md'); t = open(f).read(); a, b = '<!-- tex_alta: início -->', '<!-- tex_alta: fim -->'
    body = ['| Material | Textura (Poly Haven) | Autor(es) | Arquivos (2K, JPG) | Licença |', '|---|---|---|---|---|']
    for name, aid, info, urls in rows:
        au = ', '.join(info.get('authors', {}).keys())
        body.append(f"| `{name}` | **{info.get('name', aid)}** — https://polyhaven.com/a/{aid} | {au} | " + ' · '.join(urls[k] for k in ('diff', 'nor_gl', 'rough', 'ao')) + ' | **CC0** |')
    blk = a + '\n' + '\n'.join(body) + '\n' + b
    if a in t and b in t: t = t[:t.index(a)] + blk + t[t.index(b) + len(b):]
    else: raise SystemExit('arte/LICENCAS.md sem as marcas do tex_alta')
    open(f, 'w').write(t)

def main():
    args = [x for i, x in enumerate(sys.argv[1:]) if not x.startswith('--') and sys.argv[i] not in ('--raw', '--prev')]
    prev = None
    for i, x in enumerate(sys.argv):
        if x == '--prev' and i + 1 < len(sys.argv): prev = sys.argv[i + 1]
    only = set(args)
    for n in only:
        if n not in {m[0] for m in MATS}: raise SystemExit(f'material desconhecido: {n}')
    manifest(); rows = []; tot = 0
    for m in MATS:
        name, tier, src = m[0], m[1], m[2]
        if src[0] == 'ph': a = asset(src[1]); rows.append((name, src[1], a['info'], a['urls']))
        f = os.path.join(ROOT, 'js', f'tex3d-alta-{name}.js')
        if only and name not in only:
            tot += os.path.getsize(f) if os.path.exists(f) else 0; continue
        col, n, rough, _ = make(m); c64, g64 = encode(col, n, rough)
        sz = write_data(name, c64, g64); tot += sz
        lo = float((col @ W3 < 0.35).mean()); hi = float((col @ W3 > 1.6).mean())
        print(f'  {name:9s} {SIZE[tier]:5d}px  {m[3]}×{m[4]} m  cor {len(c64) / 1e6:5.2f} MB  relevo {len(g64) / 1e6:5.2f} MB  (abaixo de 0,35×: {lo * 100:.1f}%, acima de 1,6×: {hi * 100:.1f}%)')
        if sz > FILE_MAX: raise SystemExit(f'{name}: o arquivo passa de {FILE_MAX / 1e6:.0f} MB')
        if prev:
            os.makedirs(prev, exist_ok=True)
            Image.fromarray((np.clip(col ** (1 / 2.2) * 0.5, 0, 1) * 255).astype(np.uint8)).save(os.path.join(prev, name + '-cor.png'))
            Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8)).save(os.path.join(prev, name + '-normal.png'))
            Image.fromarray((rough * 255).astype(np.uint8)).save(os.path.join(prev, name + '-aspereza.png'))
    licences(rows)
    print(f'{len(MATS)} materiais, {tot / 1e6:.2f} MB → js/tex3d-alta*.js')
    if tot > BUDGET: raise SystemExit(f'passou do orçamento: {tot / 1e6:.2f} MB > {BUDGET / 1e6:.0f} MB')

if __name__ == '__main__':
    main()
