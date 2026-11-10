import sys, glob, os
from PIL import Image, ImageDraw
files = sorted(glob.glob('images/qa/still-*.png'), key=lambda f: float(f.split('still-')[1][:-4]))
w, h = 270, 480; cols = 6; rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * (h + 24)), 'white'); d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h)); x, y = (i % cols) * w, (i // cols) * (h + 24)
    sheet.paste(im, (x, y + 24)); d.text((x + 6, y + 6), f.split('still-')[1][:-4] + ' s', fill='black')
sheet.save('images/qa/sheet.png'); print(len(files))
