"""Flag frames whose change from the previous frame is > 2.2x the local median (must be intended cuts/swaps)."""
import cv2, numpy as np, sys
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(cv2.CAP_PROP_FPS); prev = None; d = []
while True:
    ok, f = cap.read()
    if not ok: break
    g = cv2.GaussianBlur(cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (270, 480)), (5, 5), 0).astype(np.float32)
    d.append(0 if prev is None else float(np.abs(g - prev).mean())); prev = g
d = np.array(d)
for i in range(1, len(d)):
    med = np.median(d[max(1, i - 30):i + 30]) + 0.3
    if d[i] > 2.2 * med and d[i] > 1.5: print(f'frame {i} t={i / fps:.2f}s diff={d[i]:.1f} median={med:.1f}')
print('frames', len(d), 'fps', fps)
