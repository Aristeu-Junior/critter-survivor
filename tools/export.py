import sys, json, os, numpy as np, random
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
src, segbase, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)
im = Image.open(src).convert("RGB"); a = np.asarray(im)
lab = np.load(segbase + ".labels.npy"); boxes = json.load(open(segbase + ".boxes.json"))
sprites = []
for idx, (x0, y0, x1, y1, i) in enumerate(boxes):
    m = (lab[y0:y1, x0:x1] == i)
    m = ndi.binary_fill_holes(m)
    alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))
    rgba = np.dstack([a[y0:y1, x0:x1], np.asarray(alpha)])
    img = Image.fromarray(rgba, "RGBA")
    # downscale to max 96 px for crisp small sprites
    s = 96 / max(img.size)
    if s < 1: img = img.resize((max(1, round(img.width * s)), max(1, round(img.height * s))), Image.LANCZOS)
    sprites.append(img)
    img.save(f"{outdir}/a{idx:02d}.png")
print("saved", len(sprites))

def recolor_cat(base, kind):
    rnd = random.Random(kind)
    img = base.copy(); arr = np.asarray(img).astype(np.float32); al = arr[..., 3] > 128
    h, w = al.shape
    if kind == "tiger":
        yy, xx = np.mgrid[0:h, 0:w]
        stripes = ((xx + (yy * 0.35)).astype(int) // 5) % 3 == 0
        dark = al & stripes & (arr[..., 0] > 120)
        arr[dark, :3] = arr[dark, :3] * 0.22
    elif kind in ("jaguar", "snow"):
        spots = np.zeros((h, w), bool)
        for _ in range(60):
            cx, cy = rnd.randrange(w), rnd.randrange(h); r = rnd.choice([2, 3])
            yy, xx = np.ogrid[:h, :w]; ring = ((xx - cx) ** 2 + (yy - cy) ** 2 <= r * r) & ((xx - cx) ** 2 + (yy - cy) ** 2 >= (r - 1.5) ** 2 * 0.5)
            spots |= ring
        dark = al & spots
        arr[dark, :3] = (arr[dark, :3] * (0.15 if kind == "jaguar" else 0.45))
        if kind == "jaguar": arr[al & ~dark, :3] = np.clip(arr[al & ~dark, :3] * np.array([1.05, 0.95, 0.55]), 0, 255)
    elif kind == "panther":
        arr[al, :3] = arr[al, :3] * 0.28 + np.array([8, 8, 22]) * 0.8
        # keep eyes bright: restore very bright pixels
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")

orange, gray, white = sprites[12], sprites[11], sprites[13]
out = {}
out["tiger"] = recolor_cat(orange, "tiger")
out["jaguar"] = recolor_cat(orange, "jaguar")
out["panther"] = recolor_cat(gray, "panther")
out["snow"] = recolor_cat(white, "snow")
# lion: orange cat tinted golden + mane behind head
arr = np.asarray(sprites[12]).astype(np.float32); al = arr[..., 3] > 128
arr[al, :3] = np.clip(arr[al, :3] * np.array([1.0, 0.92, 0.62]), 0, 255)
body = Image.fromarray(arr.astype(np.uint8), "RGBA")
w, h = body.size
canvas = Image.new("RGBA", (int(w * 1.4), int(h * 1.15)), (0, 0, 0, 0))
d = ImageDraw.Draw(canvas)
cx, cy = int(w * 0.76), int(h * 0.34)
for r, col in [(int(w * 0.42), (88, 48, 18, 255)), (int(w * 0.34), (120, 68, 24, 255)), (int(w * 0.27), (156, 92, 34, 255))]:
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
canvas.alpha_composite(body, (int(w * 0.02), int(h * 0.1)))
out["lion"] = canvas
for k, v in out.items():
    s = 1.35
    v = v.resize((round(v.width * s), round(v.height * s)), Image.NEAREST)
    v.save(f"{outdir}/x_{k}.png")
print("premium", list(out))
# contact sheet
names = [f"a{i:02d}.png" for i in range(44)] + [f"x_{k}.png" for k in out]
sheet = Image.new("RGB", (11 * 110, 5 * 110), (40, 50, 80))
for n, f in enumerate(names):
    t = Image.open(f"{outdir}/{f}"); t.thumbnail((100, 100)); sheet.paste(t, ((n % 11) * 110 + 5, (n // 11) * 110 + 5), t)
sheet.save(segbase + ".contact.png")
