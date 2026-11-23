import math, os
from PIL import Image, ImageDraw, ImageFont
CO=(22,58,133,255); CREAM=(246,243,234,255)
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
def fg(size):
    im=Image.new('RGBA',(size,size),(0,0,0,0)); d=ImageDraw.Draw(im); c=size/2
    r=size*0.27; n=18
    for k in range(n):
        a=2*math.pi*k/n; x=c+r*math.cos(a); y=c+r*math.sin(a); rr=size*0.021
        d.ellipse([x-rr,y-rr,x+rr,y+rr],fill=CREAM)
    f=ImageFont.truetype(FONT,int(size*0.50)); 
    bb=d.textbbox((0,0),'ą',font=f); w=bb[2]-bb[0]; h=bb[3]-bb[1]
    d.text((c-w/2-bb[0],c-h/2-bb[1]),'ą',font=f,fill=CREAM)
    return im
R='android/res'
os.makedirs(R+'/mipmap-xxxhdpi',exist_ok=True)
fg(432).save(R+'/mipmap-xxxhdpi/ic_foreground.png')   # adaptive layer (108dp @ xxxhdpi)
for dpi,px in (('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)):
    os.makedirs(f'{R}/mipmap-{dpi}',exist_ok=True)
    S=px*4; bg=Image.new('RGBA',(S,S),(0,0,0,0)); d=ImageDraw.Draw(bg)
    d.rounded_rectangle([0,0,S-1,S-1],radius=int(S*0.22),fill=CO)
    f=fg(S); bg.alpha_composite(f.resize((S,S)))
    bg.resize((px,px),Image.LANCZOS).save(f'{R}/mipmap-{dpi}/ic_launcher.png')
print('icons ok')

# web / PWA icons (also used by iPad "Add to Home Screen" and Windows Edge install)
os.makedirs('web/icons', exist_ok=True)
for px, name, maskable in ((192, 'icon-192.png', False), (512, 'icon-512.png', False), (512, 'maskable-512.png', True), (180, 'apple-touch-icon.png', True)):
    S = px * 2
    bg = Image.new('RGBA', (S, S), (0, 0, 0, 0) if not maskable else CO); d = ImageDraw.Draw(bg)
    if not maskable: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=CO)
    f = fg(int(S * (0.8 if maskable else 1))); off = (S - f.size[0]) // 2
    bg.alpha_composite(f, (off, off))
    bg.resize((px, px), Image.LANCZOS).save('web/icons/' + name)
print('web icons ok')
