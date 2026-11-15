# bichos-folha: the contact sheet of bichos-estudio.js — every frame with its name under it, in a grid.
#   python3 qa/visual/bichos-folha.py SAIDA.png [colunas]   (reads SAIDA.png.json: [[nome, arquivo], ...])
import sys, json, os
from PIL import Image, ImageDraw, ImageFont
out = sys.argv[1]; cols = int(sys.argv[2]) if len(sys.argv) > 2 else 8
cells = json.load(open(out + '.json'))
ims = [(n, Image.open(f).convert('RGB')) for n, f in cells if os.path.exists(f)]
if not ims: sys.exit(0)
w, h = ims[0][1].size; lab = 18; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + lab)), (24, 22, 20)); d = ImageDraw.Draw(sheet)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 12)
except Exception: font = ImageFont.load_default()
for k, (n, im) in enumerate(ims):
    x = (k % cols) * w; y = (k // cols) * (h + lab)
    sheet.paste(im, (x, y)); d.text((x + 4, y + h + 2), n, fill=(230, 220, 200), font=font)
sheet.save(out)
for _, f in cells:
    try: os.remove(f)
    except Exception: pass
print('folha:', out, len(ims), 'quadros')
