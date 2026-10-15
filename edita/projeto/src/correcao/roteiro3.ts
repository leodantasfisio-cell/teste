import type { Caption } from "@remotion/captions";
import { criarRoteiro, SUSTENTACAO, type Roteiro } from "./roteiro";

// Linha do tempo do vídeo 3 (texto do cliente). Usa as imagens espelhadas do lado direito.
// Enquanto a narração não existe, os trechos são estimados (~2,9 palavras/s);
// quando o áudio chegar, trocar por medidas de silencedetect e ligar NARRACAO_PRONTA.

export const NARRACAO_PRONTA = false;
export const ARQUIVO_NARRACAO = "narracao/video3/audio-exercicio.mp3";

export const TEXTOS_3 = [
  "Mantenha as duas mãos apoiadas nas coxas.",
  "Utilize esse apoio para empurrar as mãos contra as pernas, promovendo um crescimento cada vez mais axial da sua coluna.",
  "Puxe o corpo para cima.",
  "Vamos ajustar o quadril.",
  "Aperte um pouco mais o quadril do lado direito.",
  "Em seguida, leve o seu quadril também para a direção direita.",
  "Agora, atenção à respiração e ao tórax.",
  "Encha de ar e expanda as últimas costelas do lado direito.",
  "Simultaneamente, faça um movimento de fuga, afastando o tronco cada vez mais em relação ao lado esquerdo.",
  "Mantenha os ombros e a cabeça sempre alinhados.",
  "Para finalizar a postura, atenção à base da coluna.",
  "Foque em manter a curvatura natural da sua lombar, evitando deixar as costas retas.",
  "Mantenha a posição e continue respirando.",
];

/** Frases seguidas de pausa de 2 s no texto. */
const PAUSA_DEPOIS = new Set([2, 5, 8, 9, 11]);

const estimar = (): { duracao: number; trechos: [number, number][] } => {
  let t = 0;
  const trechos = TEXTOS_3.map((texto, i): [number, number] => {
    const inicio = t;
    const fim = inicio + texto.split(" ").length / 2.9 + 0.3;
    t = fim + (PAUSA_DEPOIS.has(i) ? 2 : 0.35);
    return [inicio, fim];
  });
  return { duracao: trechos[trechos.length - 1][1] + 0.3, trechos };
};

const MEDIDAS_3 = estimar();

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const criarRoteiro3 = () => {
  const base = criarRoteiro("direito");
  const m = MEDIDAS_3;
  const A1 = 0.5; // cartela de título, sem narração
  const A2 = 4.5; // narração do exercício
  const SUST_INICIO = A2 + m.duracao;
  const SUST_FIM = SUST_INICIO + SUSTENTACAO;
  const A3 = SUST_FIM + 0.4;
  const AVISO_30 = SUST_INICIO + 30;
  const AVISO_10 = SUST_INICIO + 50;
  const DURACAO = Math.ceil(A3 + 7.7 + 3.3);
  const f = (i: number) => A2 + m.trechos[i][0];

  const etapas = {
    maos: f(0),
    empurre: f(1),
    puxe: f(2),
    quadril: f(3),
    aperte: f(4),
    leveQuadril: f(5),
    respiracao: f(6),
    encha: f(7), // a coluna curva dá lugar à coluna reta aqui
    fuga: f(8),
    ombros: f(9),
    lombar: f(10),
    curvatura: f(11),
    fique: f(12),
  };

  const legendas: Caption[] = [
    ...TEXTOS_3.map((texto, i) =>
      legenda(A2 + m.trechos[i][0], A2 + m.trechos[i][1], texto),
    ),
    legenda(AVISO_30, AVISO_30 + 1.8, "Faltam trinta segundos."),
    legenda(AVISO_10, AVISO_10 + 1.8, "Faltam dez segundos."),
    legenda(A3 + 0.0, A3 + 1.6, "Pode relaxar."),
    legenda(A3 + 2.17, A3 + 3.3, "Muito bem!"),
    legenda(
      A3 + 3.47,
      A3 + 8.0,
      "Se este exercício te ajudou, inscreva-se no canal para acompanhar os próximos.",
    ),
  ];

  // Mesmo formato do roteiro dos vídeos 1 e 2, para reaproveitar cronômetro,
  // legendas, encerramento etc.
  const roteiro: Roteiro = {
    ...base,
    A1,
    A2,
    A3,
    AVISO_30,
    AVISO_10,
    SUST_INICIO,
    SUST_FIM,
    DURACAO,
    legendas,
    cena: {
      ...base.cena,
      // Linhas dos pés acendem durante a cartela de título.
      posicaoInicial: A1 + 1.5,
      maos: etapas.maos,
      cresca: etapas.quadril,
      fique: etapas.fique,
      sustentacao: SUST_INICIO,
      encerramento: SUST_FIM,
      inscreva: A3 + 3.47,
    },
  };
  return { ...roteiro, etapas };
};

export const DURACAO_3 = criarRoteiro3().DURACAO;
