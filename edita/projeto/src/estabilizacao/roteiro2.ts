import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 2 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil, igual ao vídeo 1: mão na coxa -> pega a bola e eleva o braço à
// frente (cotovelo esticado) -> movimentos circulares com a bola -> devolve a bola
// e volta à posição inicial.

type Trecho = [inicio: number, fim: number];

// Medido com silencedetect (n=-38dB, d=0.28 e d=1.0) nos áudios enviados em 17/11/2026.
const DURACAO_A1 = 21.029;
const DURACAO_A2 = 36.493;
const DURACAO_A3 = 8.176;

const TRECHOS_A1: Trecho[] = [
  [0, 4.707],
  [5.772, 7.95],
  [8.654, 11.104],
  [13.3, 18.689],
];

const TRECHOS_A2: Trecho[] = [
  [0, 3.202],
  [5.35, 9.194],
  [11.46, 18.026],
  [20.214, 23.515],
  [25.809, 29.74],
  [31.981, 36.493],
];

const TRECHOS_A3: Trecho[] = [
  [0, 1.131],
  [2.311, 3.059],
  [3.728, 7.822],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura e uma bola.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão, com a bola ao lado do pé.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Cresça a coluna para cima e mantenha a autocorreção das suas curvas.",
  "Agora, pegue a bola com as duas mãos e eleve o braço à frente, até a altura do ombro, com o cotovelo esticado.",
  "Faça pequenos movimentos circulares com a bola, bem devagar.",
  "Continue repetindo esse movimento, mantendo a coluna crescida.",
  "Para terminar, devolva a bola para o chão e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem!", "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

const CICLO = 1.6; // duração de cada posição do movimento circular (cima/baixo)

export const criarRoteiro2 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    bracosInicio: f2(2), // "Agora, pegue a bola..."
    circularInicio: f2(3), // "Faça pequenos movimentos circulares..."
    retornoInicio: f2(5), // "Para terminar, devolva a bola..."
    fimA2: A2 + DURACAO_A2,
  };

  // Movimento circular: alterna cima / frente / baixo / frente, como um ciclo.
  const circularSegmentos: { imagem: string; inicio: number; fim: number }[] =
    [];
  {
    const ordem = [
      "bola-cima.jpg",
      "bracos-frente-bola.jpg",
      "bola-baixo.jpg",
      "bracos-frente-bola.jpg",
    ];
    let t = etapas.circularInicio;
    let i = 0;
    while (etapas.retornoInicio - t > 0.9) {
      const fim = Math.min(t + CICLO, etapas.retornoInicio);
      circularSegmentos.push({ imagem: ordem[i % ordem.length], inicio: t, fim });
      t = fim;
      i++;
    }
    if (circularSegmentos.length > 0) {
      circularSegmentos[circularSegmentos.length - 1].fim =
        etapas.retornoInicio;
    }
  }

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
    circularSegmentos,
    legendas,
    pastaImagens: "esqueleto/estabilizacao2",
    narracao: {
      abertura: "narracao/estabilizacao2/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao2/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao2/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro2 = ReturnType<typeof criarRoteiro2>;
export const DURACAO_ESTABILIZACAO_2 = criarRoteiro2().DURACAO;
