import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 7 da pasta "Autocorreção Estabilização Funcional".
// Vista DE COSTAS (diferente dos vídeos 1-6, que são de perfil — decisão do
// usuário em 23/11/2026, para seguir o ângulo do vídeo-modelo). Posição inicial
// já é mãos entrelaçadas atrás da cabeça (nuca), cotovelos abertos -> cresce a
// coluna, tracionando a cabeça para cima (alonga o pescoço) -> segura alguns
// segundos -> solta as mãos e volta para a posição inicial.
//
// Só 3 áudios (sem levantar da cadeira, sem sustentação longa). Todos gerados
// (ElevenLabs) e medidos com silencedetect (n=-38dB, d=0.28) em 23/11/2026.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 16.562;
const DURACAO_A2 = 24.607;
const DURACAO_A3 = 7.784;

const TRECHOS_A1: Trecho[] = [
  [0, 3.489],
  [4.045, 5.871],
  [6.421, 8.263],
  [10.575, 16.561],
];

const TRECHOS_A2: Trecho[] = [
  [0, 6.029],
  [8.234, 13.91],
  [16.064, 19.116],
  [21.409, 24.607],
];

const TRECHOS_A3: Trecho[] = [
  [0, 0.935],
  [2.117, 7.784],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Entrelace os dedos e apoie as mãos atrás da cabeça, na nuca, com os cotovelos abertos para os lados.",
  "Agora, cresça a coluna para cima, tracionando a cabeça com as mãos, alongando o pescoço.",
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

export const criarRoteiro7 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    cresceInicio: f2(1), // "Agora, cresça a coluna..."
    retornoInicio: f2(3), // "Para terminar, solte as mãos..."
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
    pastaImagens: "esqueleto/estabilizacao7",
    narracao: {
      abertura: "narracao/estabilizacao7/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao7/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao7/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro7 = ReturnType<typeof criarRoteiro7>;
export const DURACAO_ESTABILIZACAO_7 = criarRoteiro7().DURACAO;
