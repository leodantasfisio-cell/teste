import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo 1 da pasta "Autocorreção Estabilização Funcional".
// Vista de perfil (lado), como o vídeo-modelo do usuário: mãos na coxa, braço à
// frente, joelho sobe (pé fora do chão) e, por fim, o braço também sobe na
// diagonal junto com o joelho ("dissociação de cinturas").
//
// ATENÇÃO: os trechos do áudio 2 abaixo são uma ESTIMATIVA (texto reescrito,
// ainda não medido com silencedetect). Assim que o áudio 2 novo chegar, rodar
// silencedetect (n=-38dB, d=0.28 e d=1.0) e substituir DURACAO_A2/TRECHOS_A2.

type Trecho = [inicio: number, fim: number];

const DURACAO_A1 = 17.554;
const DURACAO_A2 = 46; // estimativa: 9 frases, trocar depois de medir o áudio novo
const DURACAO_A3 = 8.255;

const TRECHOS_A1: Trecho[] = [
  [0, 3.795],
  [4.428, 6.404],
  [7.274, 9.338],
  [11.477, 14.987],
];

// Estimativa: ~3 s de fala + 2 s de pausa por linha (ajustar com silencedetect).
const TRECHOS_A2: Trecho[] = [
  [0, 3],
  [5, 8],
  [10, 13],
  [15, 18],
  [20, 23],
  [25, 28],
  [30, 34],
  [36, 40],
  [42, 46],
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
  "Coloque a mão sobre a coxa e apoie o peso nela.",
  "Cresça a coluna para cima e mantenha a autocorreção das suas curvas.",
  "Agora, eleve o braço à frente, até a altura do ombro.",
  "Mantenha o braço parado nessa posição.",
  "Comece a elevar o joelho, tirando o pé do chão, bem devagar.",
  "Continue repetindo esse movimento, mantendo a coluna crescida.",
  "Agora, mantendo o joelho subindo, leve também o braço para cima, na diagonal.",
  "Continue repetindo os dois movimentos juntos.",
  "Para terminar, pare o braço e o joelho e volte para a posição inicial.",
];

const TEXTOS_A3 = ["Pode relaxar.", "Muito bem!", "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos."];

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

const CICLO = 1.6; // duração de cada troca de pose durante a repetição

export const criarRoteiro1 = () => {
  const A1 = 0.5;
  const A2 = A1 + DURACAO_A1 + 0.42;
  const A3 = A2 + DURACAO_A2 + 0.4;
  const DURACAO = Math.ceil(A3 + DURACAO_A3 + 2.5);

  const f1 = (i: number) => A1 + TRECHOS_A1[i][0];
  const f2 = (i: number) => A2 + TRECHOS_A2[i][0];
  const f3 = (i: number) => A3 + TRECHOS_A3[i][0];

  const etapas = {
    bracosInicio: f2(2), // "Agora, eleve o braço à frente..."
    joelhoInicio: f2(4), // "Comece a elevar o joelho..."
    bracoCimaInicio: f2(6), // "...leve também o braço para cima..."
    retornoInicio: f2(8), // "Para terminar..."
    fimA2: A2 + DURACAO_A2,
  };

  // Fase 1: só o joelho sobe e desce (braço parado à frente).
  const joelhoSegmentos: { imagem: string; inicio: number; fim: number }[] =
    [];
  {
    let t = etapas.joelhoInicio;
    let subindo = true;
    while (etapas.bracoCimaInicio - t > 0.9) {
      const fim = Math.min(t + CICLO, etapas.bracoCimaInicio);
      joelhoSegmentos.push({
        imagem: subindo ? "joelho-elevado.jpg" : "bracos-frente.jpg",
        inicio: t,
        fim,
      });
      t = fim;
      subindo = !subindo;
    }
    // sobra menor que 0.9 s: estica o último segmento até o fim da fase
    if (joelhoSegmentos.length > 0) {
      joelhoSegmentos[joelhoSegmentos.length - 1].fim = etapas.bracoCimaInicio;
    }
  }

  // Fase 2: joelho e braço sobem e descem juntos ("dissociação de cinturas").
  const bracoCimaSegmentos: { imagem: string; inicio: number; fim: number }[] =
    [];
  {
    let t = etapas.bracoCimaInicio;
    let subindo = true;
    while (etapas.retornoInicio - t > 0.9) {
      const fim = Math.min(t + CICLO, etapas.retornoInicio);
      bracoCimaSegmentos.push({
        imagem: subindo ? "braco-cima-joelho.jpg" : "bracos-frente.jpg",
        inicio: t,
        fim,
      });
      t = fim;
      subindo = !subindo;
    }
    if (bracoCimaSegmentos.length > 0) {
      bracoCimaSegmentos[bracoCimaSegmentos.length - 1].fim =
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
    joelhoSegmentos,
    bracoCimaSegmentos,
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
