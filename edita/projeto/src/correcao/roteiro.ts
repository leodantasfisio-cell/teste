import type { Caption } from "@remotion/captions";
import { createContext, useContext } from "react";

// Linha do tempo do vídeo, em segundos, montada a partir das medidas de cada narração
// (silêncios + transcrição local). O mesmo roteiro serve para o lado esquerdo e o direito.

export type Lado = "esquerdo" | "direito";

type Trecho = [inicio: number, fim: number];

type Medidas = {
  /** duração do áudio 1 (abertura) */
  duracaoA1: number;
  /** duração do áudio 2 (exercício) */
  duracaoA2: number;
  /** início e fim de cada frase do áudio 1 (4 legendas) */
  a1: Trecho[];
  /** início e fim de cada frase do áudio 2 (16 legendas) */
  a2: Trecho[];
};

const MEDIDAS: Record<Lado, Medidas> = {
  esquerdo: {
    duracaoA1: 15.88,
    duracaoA2: 62.8,
    a1: [
      [0, 2.9],
      [3.18, 5.4],
      [5.65, 8.0],
      [9.81, 14.0],
    ],
    a2: [
      [0, 3.8],
      [4.08, 6.6],
      [8.42, 9.5],
      [9.64, 14.8],
      [16.61, 19.2],
      [19.58, 22.0],
      [22.2, 25.1],
      [26.84, 29.1],
      [29.29, 31.7],
      [31.95, 34.0],
      [35.96, 37.1],
      [37.34, 41.1],
      [41.44, 45.4],
      [47.26, 50.3],
      [52.29, 57.7],
      [59.52, 62.8],
    ],
  },
  direito: {
    duracaoA1: 16.9,
    duracaoA2: 61.47,
    a1: [
      [0, 3.1],
      [3.61, 6.2],
      [6.76, 9.1],
      [10.98, 14.9],
    ],
    a2: [
      [0, 3.95],
      [4.31, 6.9],
      [8.81, 9.95],
      [10.17, 14.6],
      [16.43, 19.0],
      [19.23, 21.4],
      [21.57, 24.4],
      [26.22, 28.5],
      [28.72, 30.8],
      [30.94, 32.8],
      [34.72, 36.0],
      [36.16, 40.1],
      [40.42, 44.0],
      [45.93, 48.6],
      [50.56, 56.0],
      [57.82, 61.4],
    ],
  },
};

const TEXTOS_A1 = (lado: Lado) => [
  `Exercício de correção postural para o lado ${lado}.`,
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = (lado: Lado) => [
  "Coloque as duas mãos sobre as coxas e apoie o peso nelas.",
  "Esse apoio é a base da sua postura.",
  "Agora, cresça.",
  "Estique o corpo para cima, como se o topo da sua cabeça quisesse tocar o teto.",
  "Agora, a parte de cima das costas.",
  "Leve os cotovelos um pouco para a frente.",
  "Isso ajuda a manter a curva natural dessa região.",
  "Agora, a parte de baixo das costas.",
  "Mantenha a curvinha natural da lombar.",
  "Não deixe as costas retas.",
  "Hora de respirar.",
  `Puxe o ar e encha o lado ${lado} do peito, como se fosse um balão.`,
  `Ao mesmo tempo, leve o tronco um pouco para o lado ${lado}.`,
  `Agora, gire o tronco também para o lado ${lado}.`,
  "Para terminar, continue crescendo a cabeça em direção ao teto, sem deixar os ombros subirem.",
  "Fique nessa posição por um minuto e continue respirando.",
];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const SUSTENTACAO = 60;

export const criarRoteiro = (lado: Lado) => {
  const m = MEDIDAS[lado];
  const A1 = 0.5;
  const A2 = A1 + m.duracaoA1 + 0.42;
  const SUST_INICIO = A2 + m.duracaoA2;
  const SUST_FIM = SUST_INICIO + SUSTENTACAO;
  const A3 = SUST_FIM + 0.4; // áudio 3 (encerramento), 7,7 s
  const AVISO_30 = SUST_INICIO + 30;
  const AVISO_10 = SUST_INICIO + 50;
  const DURACAO = Math.ceil(A3 + 7.7 + 3.3);
  const f = (i: number) => A2 + m.a2[i][0];

  const cena = {
    abertura: 0,
    posicaoInicial: A1 + m.a1[3][0],
    maos: A2,
    cresca: f(2),
    cotovelos: f(4),
    lombar: f(7),
    respirar: f(10),
    puxeOAr: f(11), // a coluna curva dá lugar à coluna reta aqui
    fuga: f(12),
    girar: f(13),
    terminar: f(14),
    fique: f(15),
    sustentacao: SUST_INICIO,
    encerramento: SUST_FIM,
    inscreva: A3 + 3.47,
  };

  const legendas: Caption[] = [
    ...TEXTOS_A1(lado).map((texto, i) =>
      legenda(A1 + m.a1[i][0], A1 + m.a1[i][1], texto),
    ),
    ...TEXTOS_A2(lado).map((texto, i) =>
      legenda(A2 + m.a2[i][0], A2 + m.a2[i][1], texto),
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

  return {
    lado,
    /** O lado direito usa as imagens espelhadas: setas e etiquetas também espelham. */
    espelhado: lado === "direito",
    pastaNarracao: lado === "direito" ? "narracao/direito" : "narracao",
    pastaEsqueleto: lado === "direito" ? "esqueleto/direito" : "esqueleto",
    A1,
    A2,
    A3,
    AVISO_30,
    AVISO_10,
    SUST_INICIO,
    SUST_FIM,
    DURACAO,
    cena,
    legendas,
  };
};

export type Roteiro = ReturnType<typeof criarRoteiro>;

export const RoteiroContexto = createContext<Roteiro>(criarRoteiro("esquerdo"));

export const useRoteiro = () => useContext(RoteiroContexto);
