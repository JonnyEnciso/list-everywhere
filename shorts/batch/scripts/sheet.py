"""python3 scripts/sheet.py <CompId> -> images/qa/<CompId>-sheet.png (contact sheet of that Short's stills)"""
import sys, glob
from PIL import Image, ImageDraw
cid = sys.argv[1]
files = sorted(glob.glob(f'images/qa/{cid}-[0-9]*.png'), key=lambda f: float(f.rsplit('-', 1)[1][:-4]))
w, h = 270, 480; cols = 6; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 24)), 'white'); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 24)
    sheet.paste(im, (x, y + 24)); d.text((x + 6, y + 6), f.rsplit('-', 1)[1][:-4] + ' s', fill='black')
sheet.save(f'images/qa/{cid}-sheet.png'); print(len(files))
