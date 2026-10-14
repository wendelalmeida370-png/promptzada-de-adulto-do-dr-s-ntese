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

def voronoi(S, n, seed, jitter=0.9, ny=None, stretch=(1.0, 1.0)):
    """cells: F1, F2 (in cell units), the id of the nearest point and the offset to it"""
    ny = ny or n; r = rng(seed)
    P = r.random((ny, n, 2)).astype(np.float32) * jitter + (1 - jitter) / 2
    x, y = grid(S); fx = x * n; fy = y * ny; cx = np.floor(fx).astype(int); cy = np.floor(fy).astype(int)
    f1 = np.full((S, S), 9.0, np.float32); f2 = np.full((S, S), 9.0, np.float32); idc = np.zeros((S, S), np.int64); ox = np.zeros((S, S), np.float32); oy = np.zeros((S, S), np.float32)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            gx = cx + dx; gy = cy + dy; p = P[gy % ny, gx % n]
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
