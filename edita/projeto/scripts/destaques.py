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


# Vídeo 3: imagens já espelhadas (public/esqueleto/video3), coordenadas da própria imagem.
def _v3(coluna, escapulas, cranio, costelas, ilio, _lombar):
    return {
        "maos": (
            AMBAR,
            [[(780, 520), (862, 520), (862, 712), (780, 712)], [(1145, 540), (1215, 540), (1215, 712), (1145, 712)],
             [(808, 688), (950, 688), (950, 752), (808, 752)], [(1050, 688), (1192, 688), (1192, 752), (1050, 752)]],
        ),
        "coluna": (AMBAR, [faixa(coluna, 30)]),
        "quadril": (AMBAR, [ilio]),
        "costelas-baixas": (AZUL, [costelas]),
        "cabeca-ombros": (AMBAR, [cranio, *escapulas, [(838, 270), (1145, 270), (1145, 325), (838, 325)]]),
        "lombar": (VERDE, [faixa(coluna[-3:], 34)]),
    }


def _ret(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


REGIOES_V3 = {
    "v3-s": _v3(
        [(995, 210), (985, 280), (975, 350), (975, 420), (985, 480), (1000, 540), (1005, 590), (995, 650)],
        [_ret(838, 282, 928, 402), _ret(1033, 306, 1133, 422)],
        _ret(945, 40, 1085, 252), _ret(1008, 428, 1088, 542), _ret(1028, 605, 1112, 742), None,
    ),
    "v3-mid": _v3(
        [(990, 210), (990, 300), (988, 400), (985, 480), (985, 560), (990, 640)],
        [_ret(848, 282, 942, 408), _ret(1048, 302, 1142, 422)],
        _ret(940, 40, 1070, 252), _ret(1018, 436, 1092, 542), _ret(1028, 602, 1112, 742), None,
    ),
    "v3-reta": _v3(
        [(995, 210), (995, 300), (995, 400), (995, 480), (995, 560), (995, 645)],
        [_ret(848, 292, 942, 412), _ret(1048, 292, 1147, 412)],
        _ret(930, 40, 1065, 245), _ret(1013, 436, 1092, 542), _ret(1028, 602, 1112, 742), None,
    ),
}


# Vídeo 5 (curva dupla) usa as imagens do vídeo 4 (espelho das do vídeo 3). As regiões
# são escritas nas coordenadas do vídeo 3 e espelhadas; quadril e tórax trocam de lado.
def _v5(v3, quadril_oposto, torax_oposto, cifose):
    base = {k: v3[k] for k in ("maos", "coluna", "cabeca-ombros", "lombar")}
    base["cotovelos"] = (AMBAR, [_ret(765, 470, 855, 585), _ret(1145, 470, 1235, 585)])
    base["quadril"] = (AMBAR, [quadril_oposto])
    base["torax"] = (AZUL, [torax_oposto])
    base["cifose"] = (AMBAR, [cifose])
    return {nome: (cor, [espelhar(p) for p in poligonos]) for nome, (cor, poligonos) in base.items()}


REGIOES_V3["v5-s"] = _v5(REGIOES_V3["v3-s"], _ret(872, 605, 968, 742), _ret(1015, 385, 1115, 548), _ret(925, 255, 1040, 440))
REGIOES_V3["v5-mid"] = _v5(REGIOES_V3["v3-mid"], _ret(872, 602, 968, 742), _ret(1012, 385, 1122, 548), _ret(935, 255, 1045, 440))
REGIOES_V3["v5-reta"] = _v5(REGIOES_V3["v3-reta"], _ret(872, 602, 968, 742), _ret(1015, 380, 1128, 548), _ret(940, 255, 1050, 440))


def main(origem: str, destino: str, conjunto: str = "neutro") -> None:
    img = Image.open(origem).convert("RGB")
    rgb = np.asarray(img).astype(float)
    lum = rgb.mean(axis=2)
    sat = rgb.max(axis=2) - rgb.min(axis=2)
    # Ossos: claros e levemente amarelados; o banco é cinza neutro e mais escuro.
    osso = np.clip((lum - 95) / 90, 0, 1) * (sat > 6)
    Path(destino).mkdir(parents=True, exist_ok=True)
    regioes = REGIOES_V3.get(conjunto) or (REGIOES_CURVA if conjunto == "curva" else REGIOES)
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
