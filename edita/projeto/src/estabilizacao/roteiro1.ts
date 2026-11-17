import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 1 da pasta "Autocorreção Estabilização Funcional".
// Trechos medidos na narração da ElevenLabs com silencedetect (n=-38dB, d=0.28/1.0)
// e conferidos por transcrição local (whisper.cpp).

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 17.554;
const DURACAO_A2 = 40.96;
const DURACAO_A3 = 8.255;

const TRECHOS_A1: Trecho[] = [
  [0, 3.795],
  [4.428, 6.404],
  [7.274, 9.338],
  [11.477, 14.987],
];

const TRECHOS_A2: Trecho[] = [
  [0, 3.071],
  [5.023, 8.925],
  [10.851, 14.04],
  [15.9, 19.282],
  [21.375, 24.97],
  [27.11, 31.571],
  [33.839, 40.96],
];

const TRECHOS_A3: Trecho[] = [
  [0, 0.97],
  [2.189, 2.922],
  [3.482, 8.255],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Coloque as duas mãos sobre as coxas e apoie o peso nelas.",
  "Cresça a coluna para cima e mantenha a autocorreção das suas curvas.",
  "Agora, eleve os dois braços à frente, até a altura dos ombros.",
  "Mantenha os braços parados nessa posição durante todo o exercício.",
  "Comece a elevar os pés, um de cada vez, bem devagar.",
  "Continue alternando os pés, sem parar, mantendo a coluna crescida.",
  "Para terminar, pare os pés, abaixe os braços e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem!", "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

const CROSSFADE_PERNA = 1.6;

export const criarRoteiro1 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    bracosInicio: f2(2), // "Agora, eleve os dois braços à frente..."
    pernasInicio: f2(4), // "Comece a elevar os pés..."
    retornoInicio: f2(6), // "Para terminar, pare os pés..."
    fimA2: A2 + DURACAO_A2,
  };

  // Pernas alternando (esquerdo/direito), um pouco depois do início do bracosInicio
  // dar lugar ao movimento de pés, até o início do retorno.
  const pernaSegmentos: {
    imagem: string;
    inicio: number;
    fim: number;
  }[] = [];
  {
    let t = etapas.pernasInicio;
    let ladoEsquerdo = true;
    while (t < etapas.retornoInicio) {
      const fim = Math.min(t + CROSSFADE_PERNA, etapas.retornoInicio);
      pernaSegmentos.push({
        imagem: ladoEsquerdo
          ? "pe-esquerdo-elevado.jpg"
          : "pe-direito-elevado.jpg",
        inicio: t,
        fim,
      });
      t = fim;
      ladoEsquerdo = !ladoEsquerdo;
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
    pernaSegmentos,
    legendas,
    pastaImagens: "esqueleto/estabilizacao1",
    narracao: {
      abertura: "narracao/estabilizacao1/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao1/audio2-exercicio.mp3",
      encerramento: "narracao/estabilizacao1/audio3-encerramento.mp3",
    },
  };
};

export type Roteiro1 = ReturnType<typeof criarRoteiro1>;
export const DURACAO_ESTABILIZACAO_1 = criarRoteiro1().DURACAO;
