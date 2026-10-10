import type { Caption } from "@remotion/captions";

// Linha do tempo do vídeo, em segundos.
// Tempos de fala medidos nos áudios do ElevenLabs (silêncios + transcrição local).

export const A1 = 0.5; // áudio 1 (abertura), 15,9 s
export const A2 = 16.8; // áudio 2 (exercício), 62,8 s
export const SUSTENTACAO = 60;
export const SUST_INICIO = A2 + 62.8;
export const SUST_FIM = SUST_INICIO + SUSTENTACAO;
export const A3 = SUST_FIM + 0.4; // áudio 3 (encerramento)
export const DURACAO = 150;

export const cena = {
  abertura: 0,
  posicaoInicial: A1 + 9.81,
  maos: A2,
  cresca: A2 + 8.42,
  cotovelos: A2 + 16.61,
  lombar: A2 + 26.84,
  respirar: A2 + 35.96,
  fuga: A2 + 41.44,
  girar: A2 + 47.26,
  terminar: A2 + 52.29,
  fique: A2 + 59.52,
  sustentacao: SUST_INICIO,
  encerramento: SUST_FIM,
};

const legenda = (inicio: number, fim: number, text: string): Caption => ({
  text,
  startMs: Math.round(inicio * 1000),
  endMs: Math.round(fim * 1000),
  timestampMs: null,
  confidence: null,
});

export const legendas: Caption[] = [
  legenda(
    A1 + 0.0,
    A1 + 2.9,
    "Exercício de correção postural para o lado esquerdo.",
  ),
  legenda(A1 + 3.18, A1 + 5.4, "Faça tudo com calma, no seu tempo."),
  legenda(A1 + 5.65, A1 + 8.0, "Se sentir dor, pare o exercício."),
  legenda(
    A1 + 9.81,
    A1 + 14.0,
    "Sente-se em um banco, com os pés bem apoiados no chão.",
  ),
  legenda(
    A2 + 0.0,
    A2 + 3.8,
    "Coloque as duas mãos sobre as coxas e apoie o peso nelas.",
  ),
  legenda(A2 + 4.08, A2 + 6.6, "Esse apoio é a base da sua postura."),
  legenda(A2 + 8.42, A2 + 9.5, "Agora, cresça."),
  legenda(
    A2 + 9.64,
    A2 + 14.8,
    "Estique o corpo para cima, como se o topo da sua cabeça quisesse tocar o teto.",
  ),
  legenda(A2 + 16.61, A2 + 19.2, "Agora, a parte de cima das costas."),
  legenda(A2 + 19.58, A2 + 22.0, "Leve os cotovelos um pouco para a frente."),
  legenda(
    A2 + 22.2,
    A2 + 25.1,
    "Isso ajuda a manter a curva natural dessa região.",
  ),
  legenda(A2 + 26.84, A2 + 29.1, "Agora, a parte de baixo das costas."),
  legenda(A2 + 29.29, A2 + 31.7, "Mantenha a curvinha natural da lombar."),
  legenda(A2 + 31.95, A2 + 34.0, "Não deixe as costas retas."),
  legenda(A2 + 35.96, A2 + 37.1, "Hora de respirar."),
  legenda(
    A2 + 37.34,
    A2 + 41.1,
    "Puxe o ar e encha o lado esquerdo do peito, como se fosse um balão.",
  ),
  legenda(
    A2 + 41.44,
    A2 + 45.4,
    "Ao mesmo tempo, leve o tronco um pouco para o lado esquerdo.",
  ),
  legenda(
    A2 + 47.26,
    A2 + 50.3,
    "Agora, gire o tronco também para o lado esquerdo.",
  ),
  legenda(
    A2 + 52.29,
    A2 + 57.7,
    "Para terminar, continue crescendo a cabeça em direção ao teto, sem deixar os ombros subirem.",
  ),
  legenda(
    A2 + 59.52,
    A2 + 62.8,
    "Fique nessa posição por um minuto e continue respirando.",
  ),
];
