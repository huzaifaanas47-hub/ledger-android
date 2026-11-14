#!/usr/bin/env python3
"""Generates the Ledger logo, Android launcher icons (legacy + adaptive + themed), Play Store icon and splash screens.
Run:  pip install pillow && python3 scripts/make-assets.py
Edit NAVY / GREEN / the draw_mark() geometry to rebrand."""
import os, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RES = os.path.join(ROOT, 'android/app/src/main/res')
OUT = os.path.join(ROOT, 'assets/generated')
os.makedirs(OUT, exist_ok=True)
NAVY_TOP, NAVY_BOT = (28, 63, 134), (10, 21, 48)     # tile gradient
NAVY = (15, 31, 61)                                   # #0F1F3D  (app theme colour)
GREEN_A, GREEN_B = (52, 211, 153), (16, 185, 129)     # trend arrow
WHITE = (255, 255, 255)
S = 2048                                              # master canvas (supersampled, shown as 1024)

def grad(size, c1, c2, diag=True):
    w, h = size
    base = Image.new('RGB', size, c1)
    top = Image.new('RGB', size, c2)
    mask = Image.linear_gradient('L').resize(size)
    if diag:
        mask = mask.rotate(-35, resample=Image.BICUBIC, expand=False).resize(size)
    return Image.composite(top, base, mask)

def line(d, pts, w, fill):
    for a, b in zip(pts, pts[1:]):
        d.line([a, b], fill=fill, width=w)
    for p in pts:
        d.ellipse([p[0]-w/2, p[1]-w/2, p[0]+w/2, p[1]+w/2], fill=fill)

def draw_mark(mono=False):
    """Transparent RGBA canvas SxS with the Ledger mark: a bold L + rising trend arrow."""
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    k = S / 1024.0
    P = lambda x, y: (x*k, y*k)
    # L
    line(d, [P(352, 262), P(352, 742), P(660, 742)], int(104*k), WHITE)
    # trend arrow
    col = WHITE if mono else None
    pts = [P(468, 600), P(574, 494), P(652, 566), P(768, 400)]
    if mono:
        line(d, pts, int(62*k), WHITE)
        d.polygon([P(812, 330), P(832, 452), P(716, 424)], fill=WHITE)
    else:
        g = Image.new('RGBA', (S, S), (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        line(gd, pts, int(62*k), (255, 255, 255, 255))
        gd.polygon([P(812, 330), P(832, 452), P(716, 424)], fill=(255, 255, 255, 255))
        fillg = grad((S, S), GREEN_A, GREEN_B).convert('RGBA')
        fillg.putalpha(g.split()[3])
        im.alpha_composite(fillg)
    return im

def tile(size=S, radius=0.22, circle=False, square=False):
    bg = grad((size, size), NAVY_TOP, NAVY_BOT).convert('RGBA')
    # soft highlight
    hl = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(hl).ellipse([-size*0.2, -size*0.55, size*0.9, size*0.5], fill=(255, 255, 255, 22))
    bg.alpha_composite(hl.filter(ImageFilter.GaussianBlur(size*0.03)))
    mark = draw_mark().resize((size, size), Image.LANCZOS)
    bg.alpha_composite(mark)
    if square:
        return bg
    m = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(m)
    if circle:
        md.ellipse([0, 0, size-1, size-1], fill=255)
    else:
        md.rounded_rectangle([0, 0, size-1, size-1], radius=int(size*radius), fill=255)
    bg.putalpha(m)
    return bg

def save(im, path, size=None):
    if size:
        im = im.resize((size, size), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    im.save(path)

# ---- brand files
master = tile()
save(master, f'{OUT}/icon-1024.png', 1024)
save(tile(square=True), f'{OUT}/play-store-512.png', 512)          # Play Console wants a full-bleed square
save(tile(circle=True), f'{OUT}/icon-round-512.png', 512)

# ---- Android legacy + round launcher icons
for d, px in {'mdpi': 48, 'hdpi': 72, 'xhdpi': 96, 'xxhdpi': 144, 'xxxhdpi': 192}.items():
    save(tile(radius=0.2), f'{RES}/mipmap-{d}/ic_launcher.png', px)
    save(tile(circle=True), f'{RES}/mipmap-{d}/ic_launcher_round.png', px)

# ---- adaptive icon: foreground = mark inside the 66% safe zone of a 108dp canvas; background = solid navy
fg_full = draw_mark()
mono_full = draw_mark(mono=True)
for d, px in {'mdpi': 108, 'hdpi': 162, 'xhdpi': 216, 'xxhdpi': 324, 'xxxhdpi': 432}.items():
    def adaptive(src):
        scale = 0.64                                   # mark fills ~64% of the canvas -> safely inside the mask
        inner = src.resize((int(px*scale/0.70), int(px*scale/0.70)), Image.LANCZOS)   # mark occupies ~70% of the master
        c = Image.new('RGBA', (px, px), (0, 0, 0, 0))
        c.alpha_composite(inner, ((px-inner.width)//2, (px-inner.height)//2))
        return c
    adaptive(fg_full).save(f'{RES}/mipmap-{d}/ic_launcher_foreground.png')
    adaptive(mono_full).save(f'{RES}/mipmap-{d}/ic_launcher_monochrome.png')

# ---- splash screens (navy gradient + logo + wordmark)
def splash(w, h, path):
    bg = grad((w, h), (22, 50, 108), (8, 17, 40)).convert('RGBA')
    u = min(w, h)
    icon = tile(size=1024).resize((int(u*0.30),)*2, Image.LANCZOS)
    y0 = int(h*0.5 - icon.height*0.75)
    shadow = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([(w-icon.width)//2, y0+int(u*0.015), (w+icon.width)//2, y0+icon.height+int(u*0.015)], radius=int(icon.width*0.22), fill=(0, 0, 0, 110))
    bg.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(u*0.02)))
    bg.alpha_composite(icon, ((w-icon.width)//2, y0))
    d = ImageDraw.Draw(bg)
    f1 = ImageFont.truetype(os.path.join(ROOT, 'assets/fonts/Poppins-Bold.ttf'), int(u*0.075))
    f2 = ImageFont.truetype(os.path.join(ROOT, 'assets/fonts/Poppins-Medium.ttf'), int(u*0.033))
    t1, t2 = 'Ledger', 'Smart accounts, anywhere'
    y1 = y0 + icon.height + int(u*0.045)
    d.text((w/2, y1), t1, font=f1, fill=WHITE, anchor='mt')
    d.text((w/2, y1 + int(u*0.105)), t2, font=f2, fill=(160, 184, 230), anchor='mt')
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bg.convert('RGB').save(path)

for root, _, files in os.walk(RES):
    if 'splash.png' in files and os.path.basename(root).startswith('drawable'):
        w, h = Image.open(os.path.join(root, 'splash.png')).size
        splash(w, h, os.path.join(root, 'splash.png'))
splash(1080, 1920, f'{OUT}/splash-preview.png')

# ---- vector logo for web / print
open(f'{ROOT}/assets/logo.svg', 'w').write('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1c3f86"/><stop offset="1" stop-color="#0a1530"/></linearGradient>
<linearGradient id="gr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#10b981"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>
<rect width="1024" height="1024" rx="225" fill="url(#bg)"/>
<path d="M352 262V742H660" fill="none" stroke="#fff" stroke-width="104" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M468 600L574 494L652 566L768 400" fill="none" stroke="url(#gr)" stroke-width="62" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M812 330L832 452L716 424Z" fill="url(#gr)" stroke="url(#gr)" stroke-width="10" stroke-linejoin="round"/></svg>''')

# ---- colours / adaptive icon wiring
open(f'{RES}/values/ic_launcher_background.xml', 'w').write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0F1F3D</color>\n</resources>\n')
for n in ('ic_launcher', 'ic_launcher_round'):
    open(f'{RES}/mipmap-anydpi-v26/{n}.xml', 'w').write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_monochrome"/>
</adaptive-icon>
''')
print('assets generated')
