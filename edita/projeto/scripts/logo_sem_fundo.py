"""Tira o fundo branco da logo sem mexer no desenho.

- Fundo e miolos das letras de ORTORIO viram transparentes.
- O traço branco dentro do ícone e o preenchimento das letras LAB continuam brancos.
- Bordas suaves: a cor verde é "desmisturada" do branco do antisserrilhado.
Uso: python3 -I scripts/logo_sem_fundo.py originais/.../logo.jpg public/marca/logo-sem-fundo.png
"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

# Regiões na logo original (973 × 344).
ICONE = (15, 18, 272, 280)  # quadrado verde com o "R"
LAB = (0, 248, 168, 320)  # letras LAB


def _casco_convexo(pontos: np.ndarray) -> list[tuple[float, float]]:
    """Casco convexo (monotone chain) de pontos (x, y)."""
    pts = sorted(set(map(tuple, pontos.tolist())))

    def cruz(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])

    baixo, cima = [], []
    for p in pts:
        while len(baixo) >= 2 and cruz(baixo[-2], baixo[-1], p) <= 0:
            baixo.pop()
        baixo.append(p)
    for p in reversed(pts):
        while len(cima) >= 2 and cruz(cima[-2], cima[-1], p) <= 0:
            cima.pop()
        cima.append(p)
    return baixo[:-1] + cima[:-1]


def mascara_icone(tinta: np.ndarray) -> np.ndarray:
    """Contorno convexo do ícone (quadrado arredondado): o traço branco interno fica dentro."""
    x0, y0, x1, y1 = ICONE
    lx0, ly0, lx1, _ = LAB
    so_icone = np.zeros(tinta.shape, bool)
    so_icone[y0:y1, x0:x1] = tinta[y0:y1, x0:x1]
    so_icone[ly0:, lx0:lx1] = False  # as letras LAB ficam fora do ícone
    ys, xs = np.nonzero(so_icone)
    casco = _casco_convexo(np.stack([xs, ys], axis=1))
    imagem = Image.new("L", (tinta.shape[1], tinta.shape[0]), 0)
    ImageDraw.Draw(imagem).polygon(casco, fill=255)
    # Encolhe 2 px para não levar o halo branco da borda externa.
    return np.asarray(imagem.filter(ImageFilter.MinFilter(5))) > 0


def mascara_lab(branco: np.ndarray) -> np.ndarray:
    """Miolo branco das letras LAB: brancos fechados pelo contorno verde."""
    x0, y0, x1, y1 = LAB
    regiao = Image.fromarray((branco[y0:y1, x0:x1] * 255).astype(np.uint8))
    borda = Image.new("L", (regiao.width + 2, regiao.height + 2), 255)
    borda.paste(regiao, (1, 1))
    ImageDraw.floodfill(borda, (0, 0), 128)
    fechado = np.asarray(borda)[1:-1, 1:-1] == 255
    saida = np.zeros(branco.shape, bool)
    saida[y0:y1, x0:x1] = fechado
    return saida


def main(origem: str, destino: str) -> None:
    rgb = np.asarray(Image.open(origem).convert("RGB")).astype(float)
    menor = rgb.min(axis=2)
    # Quanto de "tinta" (verde) há no pixel: 0 no branco puro, 1 no verde.
    alfa = np.clip((255 - menor) / (255 - 70), 0, 1)
    branco = menor > 200
    tinta = alfa > 0.5

    manter_branco = (mascara_icone(tinta) | mascara_lab(branco)) & (alfa < 1)

    # Desmistura o branco do antisserrilhado: cor = (pixel - (1 - a) * 255) / a.
    a = np.maximum(alfa, 1e-3)[..., None]
    cor = np.clip((rgb - (1 - a) * 255) / a, 0, 255)
    cor[manter_branco] = rgb[manter_branco]
    alfa_final = np.where(manter_branco, 1.0, alfa)

    saida = np.dstack([cor, alfa_final * 255]).astype(np.uint8)
    Image.fromarray(saida, "RGBA").save(destino, optimize=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
