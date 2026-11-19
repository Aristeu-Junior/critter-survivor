import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB"); a = np.asarray(im).astype(np.float32)
# edge strength on lightly smoothed image
sm = np.stack([ndi.gaussian_filter(a[...,c], 0.8) for c in range(3)], -1)
gx = np.stack([ndi.sobel(sm[...,c], 1) for c in range(3)], -1); gy = np.stack([ndi.sobel(sm[...,c], 0) for c in range(3)], -1)
g = np.sqrt((gx**2 + gy**2).sum(-1))
mask = g > float(sys.argv[3]) if len(sys.argv) > 3 else g > 60
mask = ndi.binary_closing(mask, iterations=3)
mask = ndi.binary_fill_holes(mask)
mask = ndi.binary_opening(mask, iterations=1)
lab, n = ndi.label(mask)
sizes = ndi.sum(mask, lab, range(1, n+1))
keep = [i+1 for i, s in enumerate(sizes) if s > 1500]
print("components", n, "kept", len(keep))
objs = ndi.find_objects(lab)
boxes = []
for i in keep:
    sl = objs[i-1]; boxes.append((sl[1].start, sl[0].start, sl[1].stop, sl[0].stop, i))
boxes.sort(key=lambda b: (round((b[1]+b[3])/2/200), b[0]))
np.save(out + ".labels.npy", lab)
import json; json.dump(boxes, open(out + ".boxes.json", "w"))
# preview
prev = Image.new("RGB", im.size, (255, 0, 255)); pa = np.asarray(prev).copy()
m2 = np.isin(lab, keep); pa[m2] = a[m2].astype(np.uint8)
Image.fromarray(pa).save(out + ".preview.png")
for b in boxes: print(b[:4], (b[2]-b[0], b[3]-b[1]))
