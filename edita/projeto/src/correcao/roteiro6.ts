import type { Caption } from "@remotion/captions";
import { criarRoteiro, SUSTENTACAO, type Roteiro } from "./roteiro";

// Linha do tempo do vídeo 6 (curva dupla, espelho do 5: quadril esquerdo, tórax para a direita).
// Trechos medidos na narração da ElevenLabs com silencedetect (n=-38dB, d=0.28) e
// conferidos na transcrição local.

export const TEXTOS_6 = [
  "Mantenha as duas mãos apoiadas nas coxas.",
  "Utilize esse apoio para promover um crescimento cada vez mais axial da sua coluna.",
  "Puxe o corpo para cima.",
  "Vamos ajustar o quadril.",
  "Aperte o quadril do lado esquerdo, levando-o para baixo e para trás.",
  "Mantenha a curvatura natural da sua lombar.",
  "Agora, a parte de cima das costas.",
  "Leve os cotovelos um pouco para a frente, para manter a curvatura natural dessa região.",
  "Agora, atenção ao tórax.",
  "Expanda o tórax do lado direito e gire um pouco o tronco para o lado direito.",
  "Mantenha os ombros e a cabeça alinhados.",
  "Agora, a respiração.",
  "Puxe o ar enchendo o lado direito do tórax, enquanto fecha o lado esquerdo.",
  "Mantenha os ombros e a cabeça sempre alinhados.",
  "Mantenha a posição e continue respirando.",
];

const MEDIDAS_6 = {
  duracao: 60.03,
  trechos: [
    [0, 2.68],
    [3.37, 7.7],
    [8.57, 10.06],
    [12.39, 13.68],
    [14.2, 18.43],
    [19.27, 21.58],
    [23.82, 26.19],
    [26.65, 30.44],
    [32.71, 34.71],
    [35.25, 39.81],
    [40.7, 43.24],
    [45.47, 46.87],
    [47.84, 52.07],
    [54.31, 56.92],
    [57.37, 59.71],
  ] as [number, number][],
};

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro6 = () => {
  // O lado direito dá os textos do cronômetro ("Encha o lado direito") e a vista de lado.
  const base = criarRoteiro("direito");
  const m = MEDIDAS_6;
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
    lombar: f(5),
    costas: f(6),
    cotovelos: f(7),
    torax: f(8),
    expanda: f(9), // a imagem intermediária dá lugar à coluna reta
    gire: f(9) + 2.4, // "e gire um pouco o tronco para o lado direito"
    ombros: f(10),
    respiracao: f(11),
    encha: f(12),
    alinhados: f(13),
    fique: f(14),
  };

  const legendas: Caption[] = [
    ...TEXTOS_6.map((texto, i) =>
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
    numeroVideo: 6,
    pastaImagens: "esqueleto/video3",
    narracao: "narracao/video6/audio-exercicio.mp3",
  };
};

export const DURACAO_6 = criarRoteiro6().DURACAO;
