import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 3 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil, igual aos vídeos 1 e 2: mão na coxa -> pega o bastão (braços à
// frente) -> eleva o bastão acima da cabeça (crescimento axial) -> inclina o tronco
// em bloco e levanta da cadeira, ficando em pé -> segura 30 s em pé -> senta de novo
// -> abaixa o bastão e volta à posição inicial.
//
// 4 áudios (o ElevenLabs não aceita uma pausa de 30 s num só <break>, por isso os
// 30 s de sustentação separam o áudio 2 do áudio 3, como nos vídeos 1-6 de
// Correção Postural):
//   1. abertura
//   2. exercício até "mantenha essa posição por trinta segundos..."
//   3. retomada, depois dos 30 s: "sente-se novamente" + "para terminar..."
//   4. encerramento
//
// ATENÇÃO: nenhum áudio foi gravado ainda — todos os trechos abaixo são ESTIMATIVA.
// Assim que os áudios chegarem, medir com silencedetect (n=-38dB, d=0.28 e d=1.0)
// e substituir as DURACAO_A*/TRECHOS_A*.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 19; // estimativa
const DURACAO_A2 = 32; // estimativa: 5 frases, até "...continue respirando"
const DURACAO_A3 = 8; // estimativa: 2 frases (retomada)
const DURACAO_A4 = 8.255; // texto idêntico aos vídeos 1 e 2 (já medido)

const TRECHOS_A1: Trecho[] = [
  [0, 4],
  [4.5, 7],
  [7.5, 10],
  [12, 17],
];

const TRECHOS_A2: Trecho[] = [
  [0, 3],
  [5, 10],
  [12, 16],
  [18, 24],
  [26, 32],
];

const TRECHOS_A3: Trecho[] = [
  [0, 3],
  [5, 8],
];

const TRECHOS_A4: Trecho[] = [
  [0, 0.97],
  [2.189, 2.922],
  [3.482, 8.255],
];

const TEXTOS_A1 = [
  "Exercício de estabilização funcional, com autocorreção da postura e um bastão.",
  "Faça tudo com calma, no seu tempo.",
  "Se sentir dor, pare o exercício.",
  "Sente-se em um banco, com os pés bem apoiados no chão, segurando um bastão.",
];

const TEXTOS_A2 = [
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Pegue o bastão com as duas mãos, na horizontal, com as mãos afastadas na largura dos ombros.",
  "Agora, eleve o bastão para cima, o máximo que conseguir, crescendo a coluna.",
  "Incline o tronco para frente, em bloco, sem curvar as costas, e levante-se da cadeira, ficando em pé.",
  "Mantenha essa posição por trinta segundos e continue respirando.",
];

const TEXTOS_A3 = [
  "Agora, sente-se novamente na cadeira, com calma.",
  "Para terminar, abaixe o bastão e volte para a posição inicial.",
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

export const criarRoteiro3 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];

  const etapas = {
    bracosInicio: f2(1), // "Pegue o bastão..."
    elevadoInicio: f2(2), // "Agora, eleve o bastão..."
    emPeInicio: f2(3), // "Incline o tronco..."
    sustInicio: f2(4), // "Mantenha essa posição por trinta segundos..."
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
    pastaImagens: "esqueleto/estabilizacao3",
    narracao: {
      abertura: "narracao/estabilizacao3/audio1-abertura.mp3",
      exercicio: "narracao/estabilizacao3/audio2-exercicio.mp3",
      retomada: "narracao/estabilizacao3/audio3-retomada.mp3",
      encerramento: "narracao/estabilizacao3/audio4-encerramento.mp3",
    },
  };
};

export type Roteiro3 = ReturnType<typeof criarRoteiro3>;
export const DURACAO_ESTABILIZACAO_3 = criarRoteiro3().DURACAO;
