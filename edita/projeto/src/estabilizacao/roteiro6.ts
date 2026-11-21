import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 6 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil, igual aos vídeos 1-5, mas mais simples: não levanta da cadeira
// e não tem sustentação de 30 s. Mão na coxa -> braços à frente (altura dos
// ombros) -> inclina o tronco para frente, dobrando no quadril, braços
// estendidos -> segura alguns segundos -> volta a endireitar o tronco -> abaixa
// os braços e volta à posição inicial. Reaproveita posicao-inicial.jpg e
// bracos-frente.jpg do vídeo 1.
//
// Só 3 áudios (sem sustentação longa, não precisa dividir o áudio 2). Todos
// gerados e medidos com silencedetect (n=-38dB, d=0.28) em 21/11/2026.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 18.233;
const DURACAO_A2 = 35.422;
const DURACAO_A3 = 7.602;

const TRECHOS_A1: Trecho[] = [
  [0, 4.041],
  [4.953, 7.158],
  [7.981, 10.126],
  [12.295, 18.233],
];

const TRECHOS_A2: Trecho[] = [
  [0, 2.714],
  [5.008, 9.586],
  [11.845, 18.126],
  [20.428, 24.309],
  [26.533, 29.192],
  [31.673, 35.422],
];

const TRECHOS_A3: Trecho[] = [
  [0, 1.09],
  [2.302, 7.225],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Eleve os braços à frente, até a altura dos ombros, mantendo o crescimento axial.",
  "Agora, incline o tronco para frente, dobrando no quadril, sem curvar as costas, mantendo os braços estendidos.",
  "Fique nessa posição por alguns segundos e continue respirando.",
  "Volte devagar, endireitando o tronco.",
  "Para terminar, abaixe os braços e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro6 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    bracosInicio: f2(1), // "Eleve os braços à frente..."
    inclinaInicio: f2(2), // "Agora, incline o tronco..."
    sustInicio: f2(3), // "Fique nessa posição por alguns segundos..."
    voltaInicio: f2(4), // "Volte devagar, endireitando o tronco."
    retornoInicio: f2(5), // "Para terminar..."
    fimA2: A2 + DURACAO_A2,
  };

  const legendas: Caption[] = [
    ...TEXTOS_A1.map((texto, i) => legenda(f1(i), A1 + TRECHOS_A1[i][1], texto)),
    ...TEXTOS_A2.map((texto, i) => legenda(f2(i), A2 + TRECHOS_A2[i][1], texto)),
    ...TEXTOS_A3.map((texto, i) => legenda(f3(i), A3 + TRECHOS_A3[i][1], texto)),
  ];

  return {
    A1,
    A2,
    A3,
    DURACAO,
    etapas,
    legendas,
    pastaImagens: "esqueleto/estabilizacao6",
    narracao: {
      abertura: "narracao/estabilizacao6/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao6/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao6/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro6 = ReturnType<typeof criarRoteiro6>;
export const DURACAO_ESTABILIZACAO_6 = criarRoteiro6().DURACAO;
