# texlib: the tools the textures are made with — periodic (tileable) noise, cells, strokes, blur, light from height.
# Everything wraps at the edges (the textures repeat without seams) and is seeded (the same picture every run).
import numpy as np
from PIL import Image, ImageDraw

def rng(seed): return np.random.default_rng(seed)

def grid(S):
    y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    return x / S, y / S

def value_noise(S, n, seed, ny=None):
    """periodic smooth noise with n x ny lattice cells over the picture"""
    ny = ny or n
    r = rng(seed); L = r.random((ny, n)).astype(np.float32)
    x, y = grid(S); fx = x * n; fy = y * ny
    ix = np.floor(fx).astype(int); iy = np.floor(fy).astype(int); tx = fx - ix; ty = fy - iy
    tx = tx * tx * (3 - 2 * tx); ty = ty * ty * (3 - 2 * ty)
    a = L[iy % ny, ix % n]; b = L[iy % ny, (ix + 1) % n]; c = L[(iy + 1) % ny, ix % n]; d = L[(iy + 1) % ny, (ix + 1) % n]
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty

def fbm(S, n, octaves, seed, gain=0.5, ny=None):
    out = np.zeros((S, S), np.float32); amp = 1.0; tot = 0.0
    for o in range(octaves):
        out += value_noise(S, n * 2 ** o, seed + o * 101, (ny or n) * 2 ** o) * amp; tot += amp; amp *= gain
    return out / tot

def sample(img, x, y):
    """bilinear, wrapping; x, y in pixels (arrays)"""
    H, W = img.shape[:2]
    x0 = np.floor(x).astype(int); y0 = np.floor(y).astype(int); fx = (x - x0)[..., None] if img.ndim == 3 else x - x0; fy = (y - y0)[..., None] if img.ndim == 3 else y - y0
    a = img[y0 % H, x0 % W]; b = img[y0 % H, (x0 + 1) % W]; c = img[(y0 + 1) % H, x0 % W]; d = img[(y0 + 1) % H, (x0 + 1) % W]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy

def warp(img, dx, dy, amt):
    S = img.shape[0]; y, x = np.mgrid[0:S, 0:S].astype(np.float32)
    return sample(img, x + (dx - 0.5) * amt * S, y + (dy - 0.5) * amt * S)

def voronoi(S, n, seed, jitter=0.9, ny=None, stretch=(1.0, 1.0), dx=None, dy=None, jy=None):
    """cells: F1, F2 (in cell units), the id of the nearest point and the offset to it; dx, dy: a periodic warp of the
    picture (0..1 units) so the edges wander instead of running straight; jy: the jitter up and down (rows of stones)"""
    ny = ny or n; r = rng(seed)
    P = r.random((ny, n, 2)).astype(np.float32); jy = jitter if jy is None else jy
    P[..., 0] = P[..., 0] * jitter + (1 - jitter) / 2; P[..., 1] = P[..., 1] * jy + (1 - jy) / 2
    x, y = grid(S)
    if dx is not None: x = x + dx
    if dy is not None: y = y + dy
    fx = x * n; fy = y * ny; cx = np.floor(fx).astype(int); cy = np.floor(fy).astype(int)
    f1 = np.full((S, S), 9.0, np.float32); f2 = np.full((S, S), 9.0, np.float32); idc = np.zeros((S, S), np.int64); ox = np.zeros((S, S), np.float32); oy = np.zeros((S, S), np.float32)
    # (cells stretched one way have their nearest points further off the other way: look that many rows or columns more,
    # or the edges break into straight seams)
    ry = 1 + int(np.ceil(stretch[0] / stretch[1] - 1)) if stretch[1] < stretch[0] else 1
    rx = 1 + int(np.ceil(stretch[1] / stretch[0] - 1)) if stretch[0] < stretch[1] else 1
    for ky in range(-ry, ry + 1):
        for kx in range(-rx, rx + 1):
            gx = cx + kx; gy = cy + ky; p = P[gy % ny, gx % n]
            px = gx + p[..., 0]; py = gy + p[..., 1]
            ddx = (px - fx) * stretch[0]; ddy = (py - fy) * stretch[1]; d = np.sqrt(ddx * ddx + ddy * ddy)
            m = d < f1
            f2 = np.where(m, f1, np.minimum(f2, d)); f1 = np.where(m, d, f1)
            idc = np.where(m, (gy % ny) * n + (gx % n), idc); ox = np.where(m, ddx, ox); oy = np.where(m, ddy, oy)
    return f1, f2, idc, ox, oy

def hash01(ids, seed):
    r = rng(seed); t = r.random(int(ids.max()) + 1).astype(np.float32); return t[ids]

def blur(img, sigma):
    """gaussian blur, periodic (by FFT)"""
    S = img.shape[0]; f = np.fft.fftfreq(S).astype(np.float32); kx, ky = np.meshgrid(f, f)
    g = np.exp(-2 * (np.pi * sigma) ** 2 * (kx * kx + ky * ky))
    if img.ndim == 2: return np.real(np.fft.ifft2(np.fft.fft2(img) * g)).astype(np.float32)
    return np.stack([blur(img[..., c], sigma) for c in range(img.shape[2])], -1)

def strokes(S, items, width_px, supersample=2):
    """draw lines on a wrapping canvas: items = [(x0, y0, x1, y1, value, w)] in 0..1 coords; returns a float map (max-composited)"""
    W = S * supersample; im = Image.new('F', (W * 3, W * 3), 0.0); dr = ImageDraw.Draw(im)
    for (x0, y0, x1, y1, v, w) in items:
        for ox in (0, 1, 2):
            for oy in (0, 1, 2):
                dr.line([((x0 + ox) * W, (y0 + oy) * W), ((x1 + ox) * W, (y1 + oy) * W)], fill=float(v), width=max(1, int(w * width_px * supersample)))
    a = np.asarray(im, np.float32)[W:2 * W, W:2 * W]
    return np.asarray(Image.fromarray(a).resize((S, S), Image.BILINEAR), np.float32) if supersample > 1 else a

def stamp_ellipses(S, items, supersample=2):
    """filled ellipses (leaves, pebbles) on a wrapping canvas: (x, y, rx, ry, angle, value) — returns value map and coverage"""
    W = S * supersample; im = Image.new('F', (W * 3, W * 3), 0.0); cov = Image.new('F', (W * 3, W * 3), 0.0); dr = ImageDraw.Draw(im); dc = ImageDraw.Draw(cov)
    for (x, y, rx, ry, a, v) in items:
        ca, sa = np.cos(a), np.sin(a); pts = [(np.cos(t) * rx * ca - np.sin(t) * ry * sa, np.cos(t) * rx * sa + np.sin(t) * ry * ca) for t in np.linspace(0, 2 * np.pi, 14, endpoint=False)]
        for ox in (0, 1, 2):
            for oy in (0, 1, 2):
                poly = [((x + ox + px) * W, (y + oy + py) * W) for px, py in pts]; dr.polygon(poly, fill=float(v)); dc.polygon(poly, fill=1.0)
    f = lambda img: np.asarray(img, np.float32)[W:2 * W, W:2 * W]
    a, c = f(im), f(cov)
    if supersample > 1:
        a = np.asarray(Image.fromarray(a).resize((S, S), Image.BILINEAR), np.float32); c = np.asarray(Image.fromarray(c).resize((S, S), Image.BILINEAR), np.float32)
    return a, c

def light(h, strength=4.0, sun=(-0.6, -0.7, 0.9)):
    """the light a height field catches from a low sun: for the albedo's baked shading (mild)"""
    gx = (np.roll(h, -1, 1) - np.roll(h, 1, 1)) * 0.5 * strength; gy = (np.roll(h, -1, 0) - np.roll(h, 1, 0)) * 0.5 * strength
    n = np.stack([-gx, -gy, np.ones_like(h)], -1); n /= np.linalg.norm(n, axis=-1, keepdims=True)
    s = np.array(sun, np.float32); s /= np.linalg.norm(s)
    return np.clip((n * s).sum(-1), 0, 1)

def ao(h, sigma=6.0, k=2.5):
    """cavities darker: how far below its surroundings a point lies"""
    return np.clip(1 - np.maximum(blur(h, sigma) - h, 0) * k, 0, 1)

def curv(h, sigma=2.0, k=6.0):
    """the shape of the surface without a sun: -1 in the hollows, +1 on the edges and crowns (a painter's edge light and
    cavity dark that reads the same on a wall, a roof or the ground, whichever way the picture is laid)"""
    return np.clip((h - blur(h, sigma)) * k, -1, 1)

def smin(a, b, k=0.05):
    """the smaller of two, blended where they are close (no crease where one takes over from the other)"""
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h)

def ridged(S, n, octaves, seed, ny=None, gain=0.5):
    """lines where a noise crosses its middle: veins, cracks, furrows (1 on the line, falling off to 0)"""
    return 1 - np.abs(fbm(S, n, octaves, seed, gain, ny) * 2 - 1)

def wfield(S, n, seed, amt, octaves=3, ny=None):
    """a periodic warp (dx, dy) in picture units, ±amt/2"""
    return (fbm(S, n, octaves, seed, ny=ny) - 0.5) * amt, (fbm(S, n, octaves, seed + 7, ny=ny) - 0.5) * amt

def stamp_polys(S, items, supersample=2):
    """filled polygons on a wrapping canvas: items = [(points [(x, y)...] in 0..1, value)] — value map and coverage
    (later ones over earlier ones)"""
    W = S * supersample; im = Image.new('F', (W * 3, W * 3), 0.0); cov = Image.new('F', (W * 3, W * 3), 0.0); dr = ImageDraw.Draw(im); dc = ImageDraw.Draw(cov)
    for pts, v in items:
        for ox in (0, 1, 2):
            for oy in (0, 1, 2):
                poly = [((px + ox) * W, (py + oy) * W) for px, py in pts]; dr.polygon(poly, fill=float(v)); dc.polygon(poly, fill=1.0)
    f = lambda img: np.asarray(img, np.float32)[W:2 * W, W:2 * W]
    a, c = f(im), f(cov)
    if supersample > 1:
        a = np.asarray(Image.fromarray(a).resize((S, S), Image.BILINEAR), np.float32); c = np.asarray(Image.fromarray(c).resize((S, S), Image.BILINEAR), np.float32)
    return a, c

def polyline_items(pts, v, w):
    """a bent line (a hair, a twig, a crack) as strokes() items"""
    return [(pts[k][0], pts[k][1], pts[k + 1][0], pts[k + 1][1], v, w) for k in range(len(pts) - 1)]

def weave(S, nx, ny, kind='plain', seed=0, slub=0.3, gap=0.18, herring=6):
    """threads crossing over and under: the height of the cloth (0..1), which thread is on top (1 warp — up and down —,
    0 weft — across) and the id of each thread (for its own tone). kind: plain (tabby), twill (2/2) or herringbone
    (the twill turning every few threads, as the northern weavers did)"""
    r = rng(seed); x, y = grid(S)
    # (threads not quite even: each its own thickness, a slub here and there, the rows wandering a little)
    wx, wy = wfield(S, 6, seed + 1, 0.6 / max(nx, ny))
    u = (x + wx) * nx; v = (y + wy) * ny; i = np.floor(u).astype(int); j = np.floor(v).astype(int); fu = u - i; fv = v - j
    thick_w = 1 - slub * value_noise(S, nx, seed + 2, 3) * (r.random(nx)[i % nx] > 0.7); thick_f = 1 - slub * value_noise(S, 3, seed + 3, ny) * (r.random(ny)[j % ny] > 0.7)
    if kind == 'plain': top = (i + j) % 2 == 0
    elif kind == 'twill': top = (i - j) % 4 < 2
    else: d = (i // herring) % 2; top = np.where(d == 0, (i - j) % 4 < 2, (i + j) % 4 < 2)
    # (a thread is round across, and dips where it passes under the other)
    pw = np.clip(1 - (np.abs(fu - 0.5) / (0.5 - gap * 0.5)) ** 2, 0, 1) ** 0.5 * thick_w
    pf = np.clip(1 - (np.abs(fv - 0.5) / (0.5 - gap * 0.5)) ** 2, 0, 1) ** 0.5 * thick_f
    hw = pw * np.where(top, 0.6 + 0.4 * np.sin(np.pi * fv), 0.35); hf = pf * np.where(top, 0.35, 0.6 + 0.4 * np.sin(np.pi * fu))
    h = np.maximum(hw, hf); which = (hw >= hf).astype(np.int32)
    ids = np.where(which == 1, i % nx, 4096 + j % ny)
    return h.astype(np.float32), which, ids

def hexc(s):
    s = s.lstrip('#'); return np.array([int(s[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255.0

def mix(a, b, t):
    col = lambda q: np.ndim(q) >= 1 and np.shape(q)[-1] == 3 and np.ndim(q) != 2
    if np.ndim(t) == 2 and (col(a) or col(b)): t = t[..., None]
    return a * (1 - t) + b * t

def smooth(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def ramp(x, stops):
    """a colour ramp: stops = [(pos, '#hex'), ...]"""
    out = np.zeros(x.shape + (3,), np.float32); P = [p for p, _ in stops]; C = [hexc(c) for _, c in stops]
    for k in range(len(stops) - 1):
        t = np.clip((x - P[k]) / max(1e-6, P[k + 1] - P[k]), 0, 1)[..., None]; m = ((x >= P[k]) & (x <= P[k + 1]))[..., None] if k < len(stops) - 2 else (x >= P[k])[..., None]
        out = np.where(m, C[k] * (1 - t) + C[k + 1] * t, out)
    out = np.where((x < P[0])[..., None], C[0], out)
    return out
