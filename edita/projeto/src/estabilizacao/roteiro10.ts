import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 10 da pasta "Autocorreção Estabilização Funcional".
// Vista de PERFIL, igual aos vídeos 1-6 e 9. Mesma lógica do vídeo 9, mas com
// bastão e braço elevado acima da cabeça (em vez de braço à frente na altura
// do ombro). Mão na coxa -> eleva o bastão para cima, crescimento axial ->
// mantendo o braço elevado, inclina o tronco para trás, bem devagar,
// contraindo o abdômen -> segura alguns segundos -> volta a endireitar o
// tronco -> abaixa o bastão e volta à posição inicial. Sem levantar da
// cadeira (diferente do vídeo 3). Reaproveita posicao-inicial.jpg do vídeo 1
// e bastao-elevado.jpg do vídeo 3.
//
// Só 3 áudios. Todos gerados (ElevenLabs) e medidos com silencedetect
// (n=-38dB, d=0.28) em 23/11/2026.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 20.898;
const DURACAO_A2 = 31.19;
const DURACAO_A3 = 8.359;

const TRECHOS_A1: Trecho[] = [
  [0, 4.759],
  [5.825, 8.226],
  [9.232, 11.648],
  [13.966, 20.898],
];

const TRECHOS_A2: Trecho[] = [
  [0, 2.754],
  [4.798, 7.987],
  [9.965, 15.804],
  [17.736, 20.945],
  [23.105, 25.462],
  [27.813, 31.19],
];

const TRECHOS_A3: Trecho[] = [
  [0, 1.159],
  [2.353, 8.359],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura e um bastão.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão, segurando um bastão.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Eleve o bastão para cima, o máximo que conseguir, crescendo a coluna.",
  "Agora, mantendo o braço elevado, incline o tronco para trás, bem devagar, contraindo o abdômen.",
  "Fique nessa posição por alguns segundos e continue respirando.",
  "Volte devagar, endireitando o tronco.",
  "Para terminar, abaixe o bastão e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem! Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro10 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    elevaInicio: f2(1), // "Eleve o bastão para cima..."
    inclinaInicio: f2(2), // "Agora, mantendo o braço elevado, incline o tronco para trás..."
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
    pastaImagens: "esqueleto/estabilizacao10",
    narracao: {
      abertura: "narracao/estabilizacao10/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao10/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao10/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro10 = ReturnType<typeof criarRoteiro10>;
export const DURACAO_ESTABILIZACAO_10 = criarRoteiro10().DURACAO;
