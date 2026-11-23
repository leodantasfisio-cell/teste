import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 9 da pasta "Autocorreção Estabilização Funcional".
// Vista de PERFIL, igual aos vídeos 1-6 (volta do perfil após os vídeos 7 e 8,
// que foram de costas). Mão na coxa -> braço reto à frente, altura do ombro
// (crescimento axial) -> mantendo o braço estendido, inclina o tronco para
// trás, bem devagar, contraindo o abdômen (estabilização abdominal, oposto ao
// vídeo 6, que inclinava para frente) -> segura alguns segundos -> volta a
// endireitar o tronco -> abaixa o braço e volta à posição inicial.
// Reaproveita posicao-inicial.jpg e bracos-frente.jpg do vídeo 1.
//
// Só 3 áudios (sem levantar da cadeira, sem sustentação longa). Todos gerados
// (ElevenLabs) e medidos com silencedetect (n=-38dB, d=0.28) em 23/11/2026.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 18.808;
const DURACAO_A2 = 31.713;
const DURACAO_A3 = 7.967;

const TRECHOS_A1: Trecho[] = [
  [0, 4.082],
  [5.162, 7.533],
  [8.378, 10.727],
  [12.887, 18.808],
];

const TRECHOS_A2: Trecho[] = [
  [0, 2.889],
  [4.937, 8.952],
  [10.983, 16.189],
  [18.2, 21.385],
  [23.567, 25.981],
  [28.26, 31.713],
];

const TRECHOS_A3: Trecho[] = [
  [0, 0.893],
  [2.126, 7.967],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Eleve o braço à frente, até a altura do ombro, mantendo o crescimento axial.",
  "Agora, mantendo o braço estendido, incline o tronco para trás, bem devagar, contraindo o abdômen.",
  "Fique nessa posição por alguns segundos e continue respirando.",
  "Volte devagar, endireitando o tronco.",
  "Para terminar, abaixe o braço e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro9 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    bracosInicio: f2(1), // "Eleve o braço à frente..."
    inclinaInicio: f2(2), // "Agora, mantendo o braço estendido, incline o tronco para trás..."
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
    pastaImagens: "esqueleto/estabilizacao9",
    narracao: {
      abertura: "narracao/estabilizacao9/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao9/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao9/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro9 = ReturnType<typeof criarRoteiro9>;
export const DURACAO_ESTABILIZACAO_9 = criarRoteiro9().DURACAO;
