import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 5 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil, igual aos vídeos 1-4: mão na coxa -> segura dois bastões
// verticais (um em cada mão, apoiados no chão à frente) empurrando contra o chão
// -> inclina o tronco em bloco e levanta da cadeira, mantendo a força contra os
// bastões -> segura 30 s em pé -> senta de novo -> solta os bastões e volta à
// posição inicial. Reaproveita posicao-inicial.jpg do vídeo 1.
//
// PENDÊNCIAS (18/11/2026):
// - Imagens ainda não geradas: bracos-frente-bastoes.jpg, em-pe-bastoes.jpg
//   (prompts no briefing edita/briefings/estabilizacao-funcional-video-5.md)
// - Áudios 1, 3 e 4 ainda não gerados (falharam por limite de conta do
//   ElevenLabs) — trechos abaixo são ESTIMATIVA. O áudio 2 já foi gerado e
//   medido com silencedetect.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 20; // estimativa
const DURACAO_A2 = 29.858; // medido
const DURACAO_A3 = 8; // estimativa
const DURACAO_A4 = 7.053; // estimativa: texto idêntico aos vídeos 1-4

const TRECHOS_A1: Trecho[] = [
  [0, 4.5],
  [5, 7.5],
  [8, 10.5],
  [12.5, 18],
];

const TRECHOS_A2: Trecho[] = [
  [0, 3.348],
  [5.501, 12.641],
  [14.82, 23.655],
  [25.859, 29.858],
];

const TRECHOS_A3: Trecho[] = [
  [0, 2.5],
  [4.7, 7.7],
];

const TRECHOS_A4: Trecho[] = [
  [0, 0.923],
  [2.122, 2.734],
  [3.244, 6.732],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura e dois bastões.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão, com um bastão apoiado no chão de cada lado.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Segure os dois bastões, um em cada mão, com os braços à frente na altura dos ombros, e empurre contra o chão.",
  "Incline o tronco para frente, em bloco, sem curvar as costas, e levante-se da cadeira, ficando em pé, mantendo a força contra os bastões.",
  "Mantenha essa posição por trinta segundos e continue respirando.",
];

const TEXTOS_A3 = [
  "Agora, sente-se novamente na cadeira, com calma.",
  "Para terminar, solte os bastões e volte para a posição inicial.",
];

const TEXTOS_A4 = ["Pode relaxar.", "Muito bem!", "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

const SUSTENTACAO = 30;

export const criarRoteiro5 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];

  const etapas = {
    bracosInicio: f2(1), // "Segure os dois bastões..."
    emPeInicio: f2(2), // "Incline o tronco..."
    sustInicio: f2(3), // "Mantenha essa posição por trinta segundos..."
  };
  const fimA2 = A2 + DURACAO_A2;
  const sustFim = etapas.sustInicio + SUSTENTACAO;
  const AVISO_10 = sustFim - 10;

  const A3 = sustFim + 0.4;
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];
  const sentaInicio = f3(0);
  const retornoInicio = f3(1);
  const fimA3 = A3 + DURACAO_A3;

  const A4 = fimA3 + 0.4;
  const f4 = (i: number) => A4 + TRECHOS_A4[i][0];
  const DURACAO = Math.ceil(A4 + DURACAO_A4 + 2.5);

  const legendas: Caption[] = [
    ...TEXTOS_A1.map((texto, i) => legenda(f1(i), A1 + TRECHOS_A1[i][1], texto)),
    ...TEXTOS_A2.map((texto, i) => legenda(f2(i), A2 + TRECHOS_A2[i][1], texto)),
    legenda(AVISO_10, AVISO_10 + 1.8, "Faltam dez segundos."),
    ...TEXTOS_A3.map((texto, i) => legenda(f3(i), A3 + TRECHOS_A3[i][1], texto)),
    ...TEXTOS_A4.map((texto, i) => legenda(f4(i), A4 + TRECHOS_A4[i][1], texto)),
  ];

  return {
    A1,
    A2,
    A3,
    A4,
    DURACAO,
    etapas: { ...etapas, fimA2, sustFim, AVISO_10, sentaInicio, retornoInicio, fimA3 },
    legendas,
    pastaImagens: "esqueleto/estabilizacao5",
    narracao: {
      abertura: "narracao/estabilizacao5/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao5/audio2-exercicio.mp3",
      retomada: "narracao/estabilizacao5/audio3-retomada.mp3",
      encerramento: "narracao/estabilizacao5/audio4-encerramento.mp3",
    },
  };
};

export type Roteiro5 = ReturnType<typeof criarRoteiro5>;
export const DURACAO_ESTABILIZACAO_5 = criarRoteiro5().DURACAO;
