# corpo-tira: the frames of corpo-estudio.js side by side in one picture (name-0.png ... name-(n-1).png → name.png)
import sys
from PIL import Image
base, n = sys.argv[1], int(sys.argv[2])
ims = [Image.open(base.replace('.png', '-%d.png' % k)) for k in range(n)]
w, h = ims[0].size; out = Image.new('RGB', (w * n, h))
for k, im in enumerate(ims): out.paste(im, (k * w, 0))
out.save(base)
