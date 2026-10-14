# folha: the contact sheet of the materials — each one as the game shows it (the world's colour times the picture, the
# relief lit by a low sun the way build3d's shader bends the normal), at its real size beside a person (1.75 m) and a
# door (1 × 2 m), tiled 2 × 2 to show seams and repetition, and close up. Nothing here goes into the game.
#   python3 arte/folha.py SAIDA.png [nome,nome...]
import sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import texturas as T
from texlib import sample, hexc

# (how each material is seen: on a wall, a roof, the ground or a thing — and the colour the world gives it)
SEEN = {
    'planks': ('wall', '#7e5e40'), 'planksH': ('wall', '#7e5e40'), 'beam': ('wall', '#6b4a30'), 'stone': ('wall', '#7c766a'),
    'brick': ('wall', '#b0603e'), 'plaster': ('wall', '#efe2c4'), 'turf': ('roof', '#71903f'), 'thatch': ('roof', '#c8a85a'),
    'tile': ('roof', '#b85a3c'), 'shingle': ('roof', '#5a4430'), 'slab': ('ground', '#cfc6b0'), 'cobble': ('ground', '#8a8478'),
    'bark': ('wall', '#6b4a2e'), 'grass': ('ground', '#5b8a3a'), 'dirt': ('ground', '#8a7050'), 'sand': ('ground', '#dcc89a'),
    'rock': ('wall', '#8a847a'), 'gravel': ('ground', '#958d80'), 'snow': ('ground', '#eef3f8'), 'forest': ('ground', '#5a4a30'),
    'soil': ('ground', '#6a4e34'),
    'door': ('thing', '#3a2616'), 'frame': ('thing', '#6b4a30'), 'iron': ('thing', '#4a4a50'), 'linen': ('thing', '#e8dcc6'),
    'canvas': ('thing', '#d8ccb0'), 'wool': ('thing', '#7a6a5a'), 'rope': ('thing', '#a08a62'), 'leather': ('thing', '#7a5034'),
    'fur': ('thing', '#8a6a4a'), 'wicker': ('thing', '#a8865a'),
}
PX = 96          # pixels per metre in the big view
WALL = (4.0, 2.6)  # metres of the big view
CLOSE = 1.0      # metres of the close-up
CPX = 300        # its pixels

def stack_layer(col, h, o):
    """the picture as the game decodes it (texturas.layer), drawn back at 512 as the game's decoder does"""
    im, mean, clip = T.layer(col, h, o)
    if im.size[0] != 512: im = im.resize((512, 512), Image.BILINEAR)
    a = np.asarray(im, np.float32) / 255
    return a[..., :3], a[..., 3]

def shade(rgb, a, metres, kind, world, wm, hm, px):
    """the patch the game would show: wm × hm metres at px pixels a metre"""
    W, H = int(wm * px), int(hm * px); S = rgb.shape[0]
    # (far off the game reads a smaller picture — the mipmap: make the same one, so the sheet does not shimmer where the
    # game would not)
    want = int(round(px * metres))
    if want < S:
        q = lambda im: np.asarray(Image.fromarray((np.clip(im, 0, 1) * 255).astype(np.uint8)).resize((want, want), Image.BOX), np.float32) / 255
        rgb, a = q(rgb), q(a); S = want
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    u = x / px / metres
    # (on a wall the game's v grows up the wall: the picture's first row is at the foot; on a roof it grows down the slope)
    v = ((H - 1 - y) if kind == 'wall' else y) / px / metres  # (a thing: its own coordinates, the picture as drawn)
    fx, fy = u * S, v * S
    F = sample(rgb, fx, fy); h0 = sample(a, fx, fy)
    e = 0.006 * S  # (the shader's step for the slope, in pixels)
    sx = (sample(a, fx + e, fy) - h0) / 0.006; sy = (sample(a, fx, fy + e) - h0) / 0.006
    bump = -np.stack([sx, sy], -1) / metres * 0.03
    # the frame of the surface (x to the right, y up, z to the eye); v up the wall: +bump.y tilts the normal up
    vy = 1.0 if kind in ('wall',) else -1.0
    n = np.stack([bump[..., 0], bump[..., 1] * vy, np.ones_like(h0)], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
    sun = np.array([-0.55, 0.62, 0.56]) if kind != 'ground' else np.array([-0.5, 0.45, 0.74]); sun /= np.linalg.norm(sun)
    lam = np.clip((n * sun).sum(-1), 0, 1)
    fac = (2 * F) ** 2.2 * 0.94
    c = (hexc(world) ** 2.2) * fac * (0.32 + 0.9 * lam)[..., None]
    return np.clip(c, 0, 1) ** (1 / 2.2)

def tone_of(rgb, world):
    """neon or washed out? the final colour without light (the world's colour times the picture): the saturation that
    only 1% of it passes, and the value of its darkest and brightest 1% (BIBLIA.md §2.2)"""
    c = np.clip((hexc(world) ** 2.2) * (2 * rgb) ** 2.2, 0, 1) ** (1 / 2.2)
    mx = c.max(-1); mn = c.min(-1); sat = np.where(mx > 1e-4, (mx - mn) / np.maximum(mx, 1e-4), 0)
    return float(np.percentile(sat, 99) * 100), float(np.percentile(mx, 1) * 100), float(np.percentile(mx, 99) * 100)

def person(d, x0, y0, px):
    """a person 1.75 m tall and a door 1 × 2 m, outlined, at (x0, y0) = feet on the image"""
    hh = 1.75 * px; w = 0.45 * px
    d.ellipse([x0 - 0.11 * px, y0 - hh, x0 + 0.11 * px, y0 - hh + 0.24 * px], outline=(255, 255, 255), width=2)
    d.rectangle([x0 - w / 2, y0 - hh + 0.26 * px, x0 + w / 2, y0 - 0.85 * px], outline=(255, 255, 255), width=2)
    d.line([x0 - 0.1 * px, y0 - 0.85 * px, x0 - 0.12 * px, y0], fill=(255, 255, 255), width=2); d.line([x0 + 0.1 * px, y0 - 0.85 * px, x0 + 0.12 * px, y0], fill=(255, 255, 255), width=2)
    dx = x0 + 0.6 * px; d.rectangle([dx, y0 - 2.0 * px, dx + 1.0 * px, y0], outline=(255, 230, 150), width=2)

def main(out, only):
    mats = [m for m in T.all_mats() if not only or m[0] in only]
    rows = []
    for m in mats:
        name, maker, metres, note = m[:4]
        col, h = maker(); kind, world = SEEN.get(name, ('thing', '#9a8a7a'))
        rgb, a = stack_layer(np.clip(col, 0, 1), np.clip(h, 0, 1), T.opts_of(m))
        big = shade(rgb, a, metres, kind, world, WALL[0], WALL[1], PX)
        close = shade(rgb, a, metres, kind, world, CLOSE, CLOSE, CPX)
        raw = np.clip(col, 0, 1)
        tile2 = np.concatenate([np.concatenate([raw, raw], 1)] * 2, 0)
        tile2 = np.asarray(Image.fromarray((tile2 * 255).astype(np.uint8)).resize((CPX, CPX), Image.LANCZOS), np.float32) / 255
        hpic = np.repeat(np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((CPX // 2, CPX // 2), Image.LANCZOS), np.float32)[..., None] / 255, 3, -1)
        lo = float(a.min()); dark = float((rgb.mean(-1) < 0.2).mean())
        sv = tone_of(rgb, world); rows.append((name, metres, note, kind, world, big, close, tile2, hpic, lo, dark, sv))
        print(f'{name:10s} S99 {sv[0]:3.0f}%  V1 {sv[1]:3.0f}%  V99 {sv[2]:3.0f}%  alfa min {lo:.2f}  escuro {dark * 100:.0f}%')
    pad = 10; Wd = int(WALL[0] * PX) + CPX * 2 + CPX // 2 + pad * 5; Hr = max(int(WALL[1] * PX), CPX) + 34
    sheet = Image.new('RGB', (Wd, Hr * len(rows) + pad), (28, 26, 30)); d = ImageDraw.Draw(sheet)
    try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
    except OSError: font = None
    for k, (name, metres, note, kind, world, big, close, tile2, hpic, lo, dark, sv) in enumerate(rows):
        y0 = k * Hr + pad
        d.text((pad, y0), f'{name}  ·  {metres} m  ·  {kind}  ·  cor {world}  ·  S99 {sv[0]:.0f}% V {sv[1]:.0f}–{sv[2]:.0f}%  ·  alfa min {lo:.2f}  —  {note}', fill=(240, 228, 200), font=font)
        x = pad; yy = y0 + 18
        sheet.paste(Image.fromarray((big * 255).astype(np.uint8)), (x, yy)); person(d, x + 0.5 * PX, yy + int(WALL[1] * PX) - 4, PX)
        x += int(WALL[0] * PX) + pad; sheet.paste(Image.fromarray((close * 255).astype(np.uint8)), (x, yy)); d.text((x + 4, yy + 4), '1 m', fill=(255, 255, 255))
        x += CPX + pad; sheet.paste(Image.fromarray((tile2 * 255).astype(np.uint8)), (x, yy)); d.text((x + 4, yy + 4), '2x2 cor', fill=(255, 255, 255))
        x += CPX + pad; sheet.paste(Image.fromarray((hpic * 255).astype(np.uint8)), (x, yy)); d.text((x + 4, yy + 4), 'altura', fill=(255, 80, 80))
    sheet.save(out); print(f'{len(rows)} materiais → {out}')

if __name__ == '__main__':
    main(sys.argv[1], [s for s in (sys.argv[2] if len(sys.argv) > 2 else '').split(',') if s])
