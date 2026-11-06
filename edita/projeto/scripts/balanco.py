# Inclinação do corpo inteiro a partir do tornozelo (estratégia de tornozelo), a partir de uma foto lateral.
# Uso: python balanco.py <imagem> <mascara> <saida.mp4> <graus_frente> <graus_tras>
import math, subprocess, sys
import cv2
import numpy as np
from PIL import Image

img_p, mask_p, out_p, frente, tras = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
img = np.asarray(Image.open(img_p).convert("RGB"))
m = np.asarray(Image.open(mask_p).convert("L")).astype(np.float32) / 255
H, W = m.shape
# Fundo sem o homem (inpaint da área dele, um pouco dilatada).
dil = cv2.dilate((m > 0.3).astype(np.uint8) * 255, np.ones((25, 25), np.uint8))
fundo = cv2.inpaint(img, dil, 9, cv2.INPAINT_TELEA)
# Pivô: tornozelo do pé da frente.
ys, xs = np.where(m > 0.5)
yb = ys.max()
pe = xs[ys > yb - 60]
piv = (float(np.median(pe)) + 10, float(yb - 45))
# Pés ficam parados: o giro some suavemente perto do tornozelo.
peso = np.clip((piv[1] + 10 - np.arange(H)) / 50.0, 0, 1)[:, None]

def quadro(ang):
    M = cv2.getRotationMatrix2D(piv, ang, 1.0)
    rot = cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    mrot = cv2.warpAffine(m, M, (W, H), flags=cv2.INTER_LINEAR)
    pessoa = rot * (mrot[..., None] * peso[..., None]) 
    a_rot = mrot * peso[:, 0][:, None]
    a_pes = m * (1 - peso[:, 0][:, None])
    out = fundo * (1 - a_rot - a_pes)[..., None] + pessoa + img * a_pes[..., None]
    return np.clip(out, 0, 255).astype(np.uint8)

def curva(t, amp):  # 3 s indo, 2 s parado, 3 s voltando
    if t < 3: u = 0.5 - 0.5 * math.cos(math.pi * t / 3)
    elif t < 5: u = 1
    else: u = 0.5 + 0.5 * math.cos(math.pi * min(t - 5, 3) / 3)
    return amp * u

fps = 30
angs = [curva(i / fps, frente) for i in range(8 * fps)] + [curva(i / fps, -tras) for i in range(8 * fps)]
cw = int(H * 16 / 9); x0 = (W - cw) // 2
ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{cw}x{H}", "-r", str(fps), "-i", "-",
                       "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-crf", "17", "-pix_fmt", "yuv420p", out_p], stdin=subprocess.PIPE)
cache = {}
for a in angs:
    k = round(a, 3)
    if k not in cache: cache[k] = quadro(a)[:, x0:x0 + cw].tobytes()
    ff.stdin.write(cache[k])
ff.stdin.close(); ff.wait()
print("pivo", piv, "quadros", len(angs))
