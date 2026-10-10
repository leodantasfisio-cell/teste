"""Gera camadas PNG de destaque a partir da imagem do esqueleto.

Cada camada pinta só os ossos (pixels claros) dentro de uma região,
para acender coluna, mãos, pés etc. por cima da imagem no Remotion.
Uso: python3 -I scripts/destaques.py public/esqueleto/costas-neutro.jpg public/esqueleto/destaques
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AMBAR = (242, 184, 75)
AZUL = (77, 163, 255)


def espelhar(poligono, centro=1000):
    return [(2 * centro - x, y) for x, y in poligono]


ANTEBRACO_MAO = [(785, 520), (860, 520), (888, 650), (882, 728), (788, 728)]
FEMUR = [(800, 682), (930, 690), (930, 748), (800, 748)]
PE = [(768, 982), (872, 982), (872, 1048), (768, 1048)]
ESCAPULA = [(858, 288), (952, 288), (952, 428), (858, 428)]

REGIOES = {
    "coluna": (AMBAR, [[(968, 195), (1032, 195), (1034, 655), (966, 655)]]),
    "maos": (
        AMBAR,
        [ANTEBRACO_MAO, espelhar(ANTEBRACO_MAO), FEMUR, espelhar(FEMUR)],
    ),
    "pes": (AMBAR, [PE, espelhar(PE)]),
    "costelas-esquerda": (AZUL, [[(878, 288), (962, 288), (962, 548), (888, 548)]]),
    "escapulas": (AMBAR, [ESCAPULA, espelhar(ESCAPULA)]),
}


def main(origem: str, destino: str) -> None:
    img = Image.open(origem).convert("RGB")
    rgb = np.asarray(img).astype(float)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    # Ossos: claros e levemente amarelados; o banco é cinza neutro e mais escuro.
    osso = np.clip((lum - 95) / 90, 0, 1) * (sat > 6)
    Path(destino).mkdir(parents=True, exist_ok=True)
    for nome, (cor, poligonos) in REGIOES.items():
        regiao = Image.new("L", img.size, 0)
        desenho = ImageDraw.Draw(regiao)
        for p in poligonos:
            desenho.polygon(p, fill=255)
        regiao = np.asarray(regiao.filter(ImageFilter.GaussianBlur(6))) / 255
        alfa = osso * regiao
        sombra = 0.55 + 0.45 * lum / 255
        saida = np.zeros((*lum.shape, 4))
        for i in range(3):
            saida[..., i] = cor[i] * sombra
            saida[..., i] *= alfa > 0.01  # cor zerada fora dos ossos: PNG bem menor
        saida[..., 3] = alfa * 255
        Image.fromarray(saida.astype(np.uint8), "RGBA").save(Path(destino) / f"{nome}.png", optimize=True)
        print(nome, f"{alfa.sum() / 1000:.0f}k px")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
