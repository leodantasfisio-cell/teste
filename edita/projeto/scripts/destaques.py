"""Gera camadas PNG de destaque a partir da imagem do esqueleto.

Cada camada pinta só os ossos (pixels claros) dentro de uma região,
para acender coluna, mãos, pés etc. por cima da imagem no Remotion.
Uso: python3 -I scripts/destaques.py <imagem> <pasta de saída> [neutro|curva]
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

AMBAR = (242, 184, 75)
AZUL = (77, 163, 255)
VERDE = (76, 195, 138)


def espelhar(poligono, centro=1000):
    return [(2 * centro - x, y) for x, y in poligono]


ANTEBRACO_MAO = [(785, 520), (860, 520), (888, 650), (882, 728), (788, 728)]
FEMUR = [(800, 682), (930, 690), (930, 748), (800, 748)]
PE = [(768, 982), (872, 982), (872, 1048), (768, 1048)]
ESCAPULA = [(858, 288), (952, 288), (952, 428), (858, 428)]
COTOVELO = [(788, 505), (868, 505), (868, 602), (788, 602)]

REGIOES = {
    "coluna": (AMBAR, [[(968, 195), (1032, 195), (1034, 655), (966, 655)]]),
    "maos": (
        AMBAR,
        [ANTEBRACO_MAO, espelhar(ANTEBRACO_MAO), FEMUR, espelhar(FEMUR)],
    ),
    "pes": (AMBAR, [PE, espelhar(PE)]),
    "costelas-esquerda": (AZUL, [[(878, 288), (962, 288), (962, 548), (888, 548)]]),
    "escapulas": (AMBAR, [ESCAPULA, espelhar(ESCAPULA)]),
    "cotovelos": (AMBAR, [COTOVELO, espelhar(COTOVELO)]),
    "lombar": (VERDE, [[(964, 538), (1036, 538), (1040, 652), (960, 652)]]),
    # Vídeo 3 (desenhado do lado esquerdo da imagem; o vídeo usa a versão espelhada).
    "quadril": (AMBAR, [[(885, 600), (1000, 600), (1000, 775), (885, 775)]]),
    "costelas-baixas": (AZUL, [[(885, 440), (990, 440), (990, 552), (885, 552)]]),
    "cabeca-ombros": (
        AMBAR,
        [[(935, 30), (1065, 30), (1065, 248), (935, 248)], ESCAPULA, espelhar(ESCAPULA),
         [(850, 280), (1150, 280), (1150, 325), (850, 325)]],
    ),
}


def faixa(pontos, meia_largura):
    """Polígono em volta de uma linha (para seguir a coluna curva)."""
    esquerda = [(x - meia_largura, y) for x, y in pontos]
    direita = [(x + meia_largura, y) for x, y in reversed(pontos)]
    return esquerda + direita


# Imagem com escoliose (costas-curva-a.jpg): mesma moldura, mas coluna torta
# e cotovelo direito mais alto.
COLUNA_CURVA = [(985, 200), (995, 280), (1010, 340), (1024, 420), (1025, 480), (1015, 540), (1002, 590), (996, 650)]
REGIOES_CURVA = {
    "coluna": (AMBAR, [faixa(COLUNA_CURVA, 32)]),
    "maos": (
        AMBAR,
        [
            ANTEBRACO_MAO,
            [(1180, 470), (1255, 470), (1235, 600), (1212, 730), (1110, 730), (1118, 640)],
            FEMUR,
            espelhar(FEMUR),
        ],
    ),
    "pes": (AMBAR, [PE, espelhar(PE)]),
    "costelas-esquerda": (AZUL, [[(892, 330), (985, 330), (995, 552), (902, 552)]]),
    "escapulas": (AMBAR, [[(866, 300), (992, 300), (992, 445), (866, 445)], [(1066, 270), (1146, 270), (1146, 395), (1066, 395)]]),
    "cotovelos": (AMBAR, [[(790, 520), (870, 520), (870, 612), (790, 612)], [(1175, 458), (1258, 458), (1258, 556), (1175, 556)]]),
    "lombar": (VERDE, [faixa(COLUNA_CURVA[5:], 36)]),
    "quadril": (AMBAR, [[(885, 600), (1000, 600), (1000, 775), (885, 775)]]),
    "costelas-baixas": (AZUL, [[(900, 435), (1000, 435), (1005, 540), (905, 540)]]),
    "cabeca-ombros": (
        AMBAR,
        [[(905, 30), (1045, 30), (1045, 250), (905, 250)], [(866, 300), (992, 300), (992, 445), (866, 445)],
         [(1066, 270), (1146, 270), (1146, 395), (1066, 395)], [(860, 270), (1150, 235), (1150, 300), (860, 330)]],
    ),
}


def main(origem: str, destino: str, conjunto: str = "neutro") -> None:
    img = Image.open(origem).convert("RGB")
    rgb = np.asarray(img).astype(float)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    # Ossos: claros e levemente amarelados; o banco é cinza neutro e mais escuro.
    osso = np.clip((lum - 95) / 90, 0, 1) * (sat > 6)
    Path(destino).mkdir(parents=True, exist_ok=True)
    regioes = REGIOES_CURVA if conjunto == "curva" else REGIOES
    for nome, (cor, poligonos) in regioes.items():
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
    main(*sys.argv[1:4])
