import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 8 da pasta "Autocorreção Estabilização Funcional".
// Vista DE COSTAS, igual ao vídeo 7. Abre sentada de lado (reaproveita
// posicao-inicial-lado.jpg do vídeo 7) e corta para a vista de costas quando
// começa a instrução das mãos. Uma mão vai para a nuca (lado côncavo da
// curva), a outra mão apoia a palma nas costas no ápice da curva (lado
// convexo) -> cresce a coluna: a mão na nuca traciona a cabeça para cima e a
// mão nas costas empurra a curva -> segura alguns segundos -> solta as mãos e
// volta para a posição inicial.
//
// 3 áudios. Todos gerados (ElevenLabs) e medidos com silencedetect
// (n=-38dB, d=0.28) em 23/11/2026.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 17.633;
const DURACAO_A2 = 30.459;
const DURACAO_A3 = 7.758;

const TRECHOS_A1: Trecho[] = [
  [0, 4.31],
  [5.01, 6.957],
  [7.619, 9.943],
  [12.104, 17.633],
];

const TRECHOS_A2: Trecho[] = [
  [0, 4.309],
  [6.379, 10.422],
  [12.364, 19.211],
  [21.211, 24.519],
  [26.716, 30.459],
];

const TRECHOS_A3: Trecho[] = [
  [0, 0.894],
  [2.093, 7.758],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Apoie uma das mãos atrás da cabeça, na nuca, com o cotovelo aberto para o lado.",
  "Com a outra mão, apoie a palma nas costas, no ápice da curva.",
  "Agora, cresça a coluna para cima: traciona a cabeça com a mão na nuca, e empurra a curva com a outra mão.",
  "Fique nessa posição por alguns segundos e continue respirando.",
  "Para terminar, solte as mãos e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro8 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    maoNucaInicio: f2(0), // "Apoie uma das mãos atrás da cabeça..."
    maoCostasInicio: f2(1), // "Com a outra mão, apoie a palma nas costas..."
    cresceInicio: f2(2), // "Agora, cresça a coluna..."
    retornoInicio: f2(4), // "Para terminar, solte as mãos..."
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
    pastaImagens: "esqueleto/estabilizacao8",
    narracao: {
      abertura: "narracao/estabilizacao8/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao8/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao8/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro8 = ReturnType<typeof criarRoteiro8>;
export const DURACAO_ESTABILIZACAO_8 = criarRoteiro8().DURACAO;
