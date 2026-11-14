# corpo_prev: a quick picture of a mesh, to look at while modelling (no GPU, no Blender render here): triangles painted
# back to front with PIL, lit by a sun and a sky. Not the game's light — only to judge shapes.
import numpy as np
from PIL import Image, ImageDraw


def _view(yaw, pitch):
    cy, sy, cp, sp = np.cos(yaw), np.sin(yaw), np.cos(pitch), np.sin(pitch)
    # (the camera looks at the body's front when yaw = 0: from +Z toward -Z)
    Ry = np.array([[cy, 0, -sy], [0, 1, 0], [sy, 0, cy]])
    Rx = np.array([[1, 0, 0], [0, cp, sp], [0, -sp, cp]])
    return Rx @ Ry


def render(V, T, col=None, nor=None, yaw=0.0, pitch=0.0, size=(360, 640), box=None, ss=2, bg=(196, 206, 214), sun=(0.5, 0.7, 0.6)):
    """V (n,3), T (m,3) triangles, col per vertex (n,3) 0..1 or None; box: (cx, cy, half-height) of the view in metres."""
    R = _view(yaw, pitch)
    P = V @ R.T
    W, H = size[0] * ss, size[1] * ss
    if box is None:
        lo, hi = P.min(0), P.max(0); cx, cy = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2; hh = (hi[1] - lo[1]) / 2 * 1.08
    else:
        cx, cy, hh = box
    sc = H / (2 * hh)
    X = (P[:, 0] - cx) * sc + W / 2; Y = H / 2 - (P[:, 1] - cy) * sc
    a, b, c = T[:, 0], T[:, 1], T[:, 2]
    fn = np.cross(P[b] - P[a], P[c] - P[a]); fl = np.linalg.norm(fn, axis=1); fn = fn / np.maximum(fl, 1e-12)[:, None]
    vis = fn[:, 2] > 0  # (facing the camera: +Z toward it)
    if nor is not None:
        N = nor @ R.T; n = N[a] + N[b] + N[c]; n = n / np.maximum(np.linalg.norm(n, axis=1), 1e-12)[:, None]
    else:
        n = fn
    s = np.asarray(sun, float); s = s / np.linalg.norm(s); s = R @ s
    lam = np.clip(n @ s, 0, 1)
    sky = 0.5 + 0.5 * n[:, 1]
    rim = (1 - np.clip(n[:, 2], 0, 1)) ** 3 * 0.25
    base = np.ones((len(T), 3)) * 0.8 if col is None else (col[a] + col[b] + col[c]) / 3
    lit = base * (0.62 * lam[:, None] + 0.38 * sky[:, None]) + rim[:, None] * base
    lit = np.clip(lit ** (1 / 1.25), 0, 1)
    z = (P[a, 2] + P[b, 2] + P[c, 2]) / 3
    order = np.argsort(z)
    img = Image.new('RGB', (W, H), bg); d = ImageDraw.Draw(img)
    for i in order:
        if not vis[i]: continue
        cc = tuple(int(q * 255) for q in lit[i])
        d.polygon([(X[a[i]], Y[a[i]]), (X[b[i]], Y[b[i]]), (X[c[i]], Y[c[i]])], fill=cc)
    return img.resize(size, Image.LANCZOS)


def sheet(imgs, path):
    w = sum(i.size[0] for i in imgs); h = max(i.size[1] for i in imgs)
    out = Image.new('RGB', (w, h)); x = 0
    for i in imgs: out.paste(i, (x, 0)); x += i.size[0]
    out.save(path)
