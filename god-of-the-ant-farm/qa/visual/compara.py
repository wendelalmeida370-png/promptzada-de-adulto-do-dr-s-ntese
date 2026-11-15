# compara: antes | depois lado a lado, uma imagem por vista: python3 qa/visual/compara.py PASTA_ANTES PASTA_DEPOIS SAIDA
import sys, os
from PIL import Image, ImageDraw
a, b, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True)
for n in sorted(os.listdir(b)):
    if not n.endswith('.png') or not os.path.exists(os.path.join(a, n)): continue
    A = Image.open(os.path.join(a, n)).convert('RGB'); B = Image.open(os.path.join(b, n)).convert('RGB')
    w = 700; A = A.resize((w, int(A.height * w / A.width))); B = B.resize((w, int(B.height * w / B.width)))
    im = Image.new('RGB', (w * 2 + 6, max(A.height, B.height) + 24), (24, 24, 24)); im.paste(A, (0, 24)); im.paste(B, (w + 6, 24))
    d = ImageDraw.Draw(im); d.text((6, 5), 'ANTES · ' + n[:-4], fill=(255, 255, 255)); d.text((w + 12, 5), 'DEPOIS · ' + n[:-4], fill=(255, 255, 255))
    im.save(os.path.join(out, n))
print('ok')
