import type { Caption } from "@remotion/captions";
import { criarRoteiro, SUSTENTACAO, type Roteiro } from "./roteiro";

// Linha do tempo do vídeo 5 (curva dupla: quadril para a direita, tórax para a esquerda).
// Trechos medidos na narração da ElevenLabs com silencedetect (n=-38dB, d=0.28) e
// conferidos na transcrição local.

export const TEXTOS_5 = [
  "Mantenha as duas mãos apoiadas nas coxas.",
  "Utilize esse apoio para promover um crescimento cada vez mais axial da sua coluna.",
  "Puxe o corpo para cima.",
  "Vamos ajustar o quadril.",
  "Aperte um pouco mais o quadril do lado direito.",
  "Em seguida, gire o quadril para o lado direito, mantendo a curvatura natural da sua lombar.",
  "Agora, a parte de cima das costas.",
  "Leve os cotovelos um pouco para a frente, para manter a curvatura natural dessa região.",
  "Agora, atenção à respiração e ao tórax.",
  "Encha de ar e expanda o tórax do lado esquerdo.",
  "Simultaneamente, gire a parte de cima das costas para o lado esquerdo.",
  "Mantenha os ombros e a cabeça sempre alinhados.",
  "Mantenha a posição e continue respirando.",
];

const MEDIDAS_5 = {
  duracao: 55.72,
  trechos: [
    [0, 2.39],
    [2.82, 7.14],
    [8.09, 9.51],
    [11.84, 13.12],
    [13.61, 16.04],
    [16.55, 22.61],
    [24.88, 26.73],
    [27.25, 31.27],
    [33.7, 36.8],
    [37.4, 40.19],
    [41.11, 45.09],
    [47.28, 50.21],
    [52.43, 55.32],
  ] as [number, number][],
};

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro5 = () => {
  // O lado esquerdo dá os textos do cronômetro ("Encha o lado esquerdo") e a vista de lado.
  const base = criarRoteiro("esquerdo");
  const m = MEDIDAS_5;
  const A1 = 0.5; // cartela de título, sem narração
  const A2 = 4.5; // narração do exercício
  const SUST_INICIO = A2 + m.duracao;
  const SUST_FIM = SUST_INICIO + SUSTENTACAO;
  const A3 = SUST_FIM + 0.4;
  const AVISO_30 = SUST_INICIO + 30;
  const AVISO_10 = SUST_INICIO + 50;
  const DURACAO = Math.ceil(A3 + 7.7 + 3.3);
  const f = (i: number) => A2 + m.trechos[i][0];

  const etapas = {
    maos: f(0),
    empurre: f(1),
    puxe: f(2),
    quadril: f(3), // a curva em S dá lugar à imagem intermediária
    aperte: f(4),
    gireQuadril: f(5),
    costas: f(6),
    cotovelos: f(7),
    respiracao: f(8),
    encha: f(9), // a imagem intermediária dá lugar à coluna reta
    gireTorax: f(10),
    ombros: f(11),
    fique: f(12),
  };

  const legendas: Caption[] = [
    ...TEXTOS_5.map((texto, i) =>
      legenda(A2 + m.trechos[i][0], A2 + m.trechos[i][1], texto),
    ),
    legenda(AVISO_30, AVISO_30 + 1.8, "Faltam trinta segundos."),
    legenda(AVISO_10, AVISO_10 + 1.8, "Faltam dez segundos."),
    legenda(A3 + 0.0, A3 + 1.6, "Pode relaxar."),
    legenda(A3 + 2.17, A3 + 3.3, "Muito bem!"),
    legenda(
      A3 + 3.47,
      A3 + 8.0,
      "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.",
    ),
  ];

  const roteiro: Roteiro = {
    ...base,
    A1,
    A2,
    A3,
    AVISO_30,
    AVISO_10,
    SUST_INICIO,
    SUST_FIM,
    DURACAO,
    legendas,
    cena: {
      ...base.cena,
      // Linhas dos pés acendem durante a cartela de título.
      posicaoInicial: A1 + 1.5,
      maos: etapas.maos,
      cresca: etapas.quadril,
      fique: etapas.fique,
      sustentacao: SUST_INICIO,
      encerramento: SUST_FIM,
      inscreva: A3 + 3.47,
    },
  };
  return {
    ...roteiro,
    etapas,
    numeroVideo: 5,
    pastaImagens: "esqueleto/video4",
    narracao: "narracao/video5/audio-exercicio.mp3",
  };
};

export const DURACAO_5 = criarRoteiro5().DURACAO;
