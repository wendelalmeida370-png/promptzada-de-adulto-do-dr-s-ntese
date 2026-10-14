# corpo_filme: draws the frames qa/visual/corpo-filme.js wrote — the skin in motion, side by side, with the ground line
#   python arte/corpo_filme.py filme.bin saida.png [yaw: 1.5708 = from the side] [width of a frame in px]
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from corpo_prev import render
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
yaw = float(sys.argv[3]) if len(sys.argv) > 3 else 1.5708
fw = int(sys.argv[4]) if len(sys.argv) > 4 else 220
b = open(src, 'rb').read()
n, nt, nf = np.frombuffer(b[:12], np.uint32)
T = np.frombuffer(b[12:12 + nt * 12], np.uint32).reshape(-1, 3).astype(np.int64)
o = 12 + nt * 12
zone = np.frombuffer(b[o:o + n], np.uint8); o += n
frames = [np.frombuffer(b[o + k * n * 12: o + (k + 1) * n * 12], np.float32).reshape(-1, 3).astype(np.float64) for k in range(nf)]
col = np.tile(np.array([[0.82, 0.6, 0.48]]), (n, 1)); col[zone > 0] = [0.95, 0.95, 0.95]
imgs = []
for V in frames:
    c = V.mean(0)
    # (each frame centred on the body; the ground at y = 0 drawn as a line)
    im = render(V - np.array([c[0], 0, c[2]]), T, col, None, yaw=yaw, pitch=0.0, size=(fw, 400), box=(0.0, 0.92, 1.0))
    d = ImageDraw.Draw(im); gy = 400 / 2 + (0.92) * 400 / 2.0
    d.line([(0, gy), (fw, gy)], fill=(90, 110, 90), width=1)
    imgs.append(im)
W = Image.new('RGB', (fw * len(imgs), 400))
for k, im in enumerate(imgs): W.paste(im, (k * fw, 0))
W.save(out)
print('wrote', out)
