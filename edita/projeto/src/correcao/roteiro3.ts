import type { Caption } from "@remotion/captions";
import { criarRoteiro, SUSTENTACAO, type Lado, type Roteiro } from "./roteiro";

// Linha do tempo dos vídeos 3 (lado direito) e 4 (mesmo exercício para o lado esquerdo).
// Trechos medidos na narração da ElevenLabs com silencedetect (n=-38dB, d=0.28) e
// conferidos na transcrição local.

const CONFIG = {
  direito: { video: 3, pasta: "esqueleto/video3", narracaoPronta: true },
  esquerdo: { video: 4, pasta: "esqueleto/video4", narracaoPronta: true },
} as const;

const oposto = (lado: Lado): Lado =>
  lado === "direito" ? "esquerdo" : "direito";
const sentido = (lado: Lado) => (lado === "direito" ? "direita" : "esquerda");

export const textos3 = (lado: Lado) => [
  "Mantenha as duas mãos apoiadas nas coxas.",
  "Utilize esse apoio para empurrar as mãos contra as pernas, promovendo um crescimento cada vez mais axial da sua coluna.",
  "Puxe o corpo para cima.",
  "Vamos ajustar o quadril.",
  `Aperte um pouco mais o quadril do lado ${lado}.`,
  `Em seguida, leve o seu quadril também para a direção ${sentido(lado)}.`,
  "Agora, atenção à respiração e ao tórax.",
  `Encha de ar e expanda as últimas costelas do lado ${lado}.`,
  `Simultaneamente, faça um movimento de fuga, afastando o tronco cada vez mais em relação ao lado ${oposto(lado)}.`,
  "Mantenha os ombros e a cabeça sempre alinhados.",
  "Para finalizar a postura, atenção à base da coluna.",
  "Foque em manter a curvatura natural da sua lombar, evitando deixar as costas retas.",
  "Mantenha a posição e continue respirando.",
];

type Medidas3 = { duracao: number; trechos: [number, number][] };

const MEDIDAS_3: Medidas3 = {
  duracao: 60.0,
  trechos: [
    [0, 2.53],
    [3.11, 10.0],
    [10.98, 12.18],
    [14.6, 15.87],
    [16.37, 18.72],
    [19.48, 22.69],
    [25.08, 28.41],
    [29.08, 32.8],
    [33.83, 39.76],
    [41.79, 44.43],
    [46.48, 49.6],
    [50.56, 55.32],
    [57.54, 59.64],
  ],
};

const MEDIDAS_4: Medidas3 = {
  duracao: 57.39,
  trechos: [
    [0, 2.43],
    [3.08, 9.84],
    [10.84, 12.23],
    [14.45, 15.72],
    [16.13, 18.71],
    [19.34, 22.81],
    [25.11, 27.55],
    [28.17, 31.11],
    [31.72, 37.69],
    [39.85, 42.38],
    [44.59, 47.48],
    [48.17, 52.8],
    [54.98, 57.07],
  ],
};

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro3 = (lado: Lado = "direito") => {
  const base = criarRoteiro(lado);
  const config = CONFIG[lado];
  const m = lado === "direito" ? MEDIDAS_3 : MEDIDAS_4;
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
    quadril: f(3),
    aperte: f(4),
    leveQuadril: f(5),
    respiracao: f(6),
    encha: f(7), // a coluna curva dá lugar à coluna reta aqui
    fuga: f(8),
    ombros: f(9),
    lombar: f(10),
    curvatura: f(11),
    fique: f(12),
  };

  const legendas: Caption[] = [
    ...textos3(lado).map((texto, i) =>
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

  // Mesmo formato do roteiro dos vídeos 1 e 2, para reaproveitar cronômetro,
  // legendas, encerramento etc.
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
    numeroVideo: config.video,
    pastaImagens: config.pasta,
    narracao: config.narracaoPronta
      ? `narracao/video${config.video}/audio-exercicio.mp3`
      : null,
    sentido: sentido(lado),
    ladoOposto: oposto(lado),
  };
};

export const DURACAO_3 = criarRoteiro3("direito").DURACAO;
export const DURACAO_4 = criarRoteiro3("esquerdo").DURACAO;
