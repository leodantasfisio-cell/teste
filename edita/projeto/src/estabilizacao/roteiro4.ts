import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 4 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil, igual aos vídeos 1-3, mas sem objeto: mão na coxa -> braços à
// frente (altura dos ombros) -> inclina o tronco em bloco e levanta da cadeira,
// ficando em pé -> segura 30 s em pé -> senta de novo -> abaixa os braços e volta
// à posição inicial. Reaproveita posicao-inicial.jpg e bracos-frente.jpg do vídeo 1.
//
// 4 áudios (mesmo motivo do vídeo 3: o ElevenLabs não aceita uma pausa de 30 s
// num só <break>):
//   1. abertura (medido)
//   2. exercício até "mantenha essa posição por trinta segundos..." (ESTIMATIVA —
//      falhou na geração por limite de conta do ElevenLabs, gerar de novo e medir)
//   3. retomada, depois dos 30 s (medido)
//   4. encerramento (ESTIMATIVA — ainda não gerado)

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 17.737;
const DURACAO_A2 = 26; // estimativa: 4 frases, até "...continue respirando"
const DURACAO_A3 = 8.176;
const DURACAO_A4 = 7.053; // estimativa: texto idêntico aos vídeos 1-3

const TRECHOS_A1: Trecho[] = [
  [0, 3.919],
  [4.831, 6.872],
  [7.567, 9.519],
  [11.687, 15.293],
];

const TRECHOS_A2: Trecho[] = [
  [0, 3],
  [5, 11],
  [13, 19],
  [21, 26],
];

const TRECHOS_A3: Trecho[] = [
  [0, 2.564],
  [4.783, 7.741],
];

const TRECHOS_A4: Trecho[] = [
  [0, 0.923],
  [2.122, 2.734],
  [3.244, 6.732],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Eleve os braços à frente, até a altura dos ombros, com as mãos na largura dos ombros, mantendo o crescimento axial.",
  "Incline o tronco para frente, em bloco, sem curvar as costas, e levante-se da cadeira, ficando em pé.",
  "Mantenha essa posição por trinta segundos e continue respirando.",
];

const TEXTOS_A3 = [
  "Agora, sente-se novamente na cadeira, com calma.",
  "Para terminar, abaixe os braços e volte para a posição inicial.",
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

export const criarRoteiro4 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];

  const etapas = {
    bracosInicio: f2(1), // "Eleve os braços à frente..."
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
    pastaImagens: "esqueleto/estabilizacao4",
    narracao: {
      abertura: "narracao/estabilizacao4/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao4/audio2-exercicio.mp3",
      retomada: "narracao/estabilizacao4/audio3-retomada.mp3",
      encerramento: "narracao/estabilizacao4/audio4-encerramento.mp3",
    },
  };
};

export type Roteiro4 = ReturnType<typeof criarRoteiro4>;
export const DURACAO_ESTABILIZACAO_4 = criarRoteiro4().DURACAO;
