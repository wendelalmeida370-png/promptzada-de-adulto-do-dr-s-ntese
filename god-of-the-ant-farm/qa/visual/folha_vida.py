# folha_vida: draws the poses qa/visual/folha-vida.js wrote — the sheet of the life that is seen, a grid of bodies of three
# quarters with their names under them (the drawing of arte/corpo_prev.py: only to judge the shapes, not the game's light)
#   python3 qa/visual/folha_vida.py folha.bin folha.png [colunas=8] [yaw=1.0]
import sys, os, json, unicodedata
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'arte'))
from corpo_prev import render
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 8
yaw = float(sys.argv[4]) if len(sys.argv) > 4 else 1.0
# (the names without their accents: the plain font of PIL has none)
names = [unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode() for n in json.load(open(src + '.json'))]
b = open(src, 'rb').read()
n, nt, nf = np.frombuffer(b[:12], np.uint32)
T = np.frombuffer(b[12:12 + nt * 12], np.uint32).reshape(-1, 3).astype(np.int64)
o = 12 + nt * 12
zone = np.frombuffer(b[o:o + n], np.uint8); o += n
frames = [np.frombuffer(b[o + k * n * 12: o + (k + 1) * n * 12], np.float32).reshape(-1, 3).astype(np.float64) for k in range(nf)]
col = np.tile(np.array([[0.82, 0.6, 0.48]]), (n, 1))
ZC = {1: [0.95, 0.95, 0.95], 2: [0.95, 0.95, 0.95], 3: [0.33, 0.2, 0.1], 4: [0.38, 0.22, 0.1], 5: [0.42, 0.3, 0.18], 6: [0.55, 0.22, 0.2], 7: [0.25, 0.3, 0.45], 8: [0.6, 0.62, 0.66], 9: [0.5, 0.25, 0.2], 10: [0.85, 0.72, 0.4], 11: [0.3, 0.3, 0.25], 12: [0.9, 0.88, 0.8], 13: [0.85, 0.7, 0.3], 14: [0.35, 0.27, 0.2], 15: [0.86, 0.84, 0.78], 16: [0.85, 0.75, 0.3], 17: [0.7, 0.15, 0.12], 18: [0.15, 0.13, 0.12], 19: [0.2, 0.55, 0.35], 20: [0.92, 0.9, 0.84], 21: [0.25, 0.5, 0.25]}
for z, c in ZC.items(): col[zone == z] = c
fw, fh = 200, 300
rows = (len(frames) + cols - 1) // cols
W = Image.new('RGB', (fw * cols, (fh + 22) * rows), (236, 236, 232))
for k, V in enumerate(frames):
    c = V.mean(0)
    im = render(V - np.array([c[0], 0, c[2]]), T, col, None, yaw=yaw, pitch=0.08, size=(fw, fh), box=(0.0, 0.88, 1.0))
    x, y = (k % cols) * fw, (k // cols) * (fh + 22)
    W.paste(im, (x, y)); ImageDraw.Draw(W).text((x + 6, y + fh + 4), names[k] if k < len(names) else '', fill=(30, 30, 30))
W.save(out)
print('wrote', out, len(frames), 'poses')
