import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Amputação 01 — transferência de peso laterolateral.
// Clipes do Gemini (Veo) espelhados para a prótese ficar na perna direita (à esquerda da tela),
// desacelerados e com parada de 2 s (ver briefings/amputacao-01-transferencia-peso-laterolateral.md).
// Cada ciclo: 3 s indo, 2 s parado, ~2,8 s voltando.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.inOut(Easing.sin);

export const CICLO_PROTESE = 7.7;
export const CICLO_PERNA = 7.86;
const FUSAO = 0.4; // sobreposição entre clipes para esconder a diferença de luz

const T = (() => {
  const inicio = 0;
  const protese1 = 4;
  const perna1 = protese1 + CICLO_PROTESE - FUSAO;
  const zoomIn = perna1 + CICLO_PERNA;
  const protese2 = zoomIn + 1;
  const perna2 = protese2 + CICLO_PROTESE - FUSAO;
  const zoomOut = perna2 + CICLO_PERNA;
  return { inicio, protese1, perna1, zoomIn, protese2, perna2, zoomOut };
})();

export const DURACAO_TRANSFERENCIA = Math.ceil(T.zoomOut + 4);

/** Aproximação da pelve e das pernas, com os pés na base do quadro. */
const ZOOM = 1.6;

/** 0 → 1 → 0 do deslocamento da pelve dentro de um ciclo (segundos do ciclo). */
const deslocamento = (t: number, duracao: number) =>
  interpolate(t, [0, 3, 5, duracao], [0, 1, 1, 0], { ...clamp, easing: suave });

// Seta horizontal discreta na altura da cintura, crescendo para o lado do deslocamento.
const SetaPelve: React.FC<{ direcao: -1 | 1; duracao: number }> = ({
  direcao,
  duracao,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = deslocamento(frame / fps, duracao);
  if (u < 0.02) return null;
  const y = 575;
  const x0 = 905; // centro do corpo no quadro (o homem fica um pouco à esquerda do meio)
  const x1 = x0 + direcao * (60 + 150 * u);
  const ponta = 22;
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, u * 3) * 0.9,
      }}
    >
      <line
        x1={x0}
        y1={y}
        x2={x1}
        y2={y}
        stroke="#F2B84B"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1 - direcao * ponta} ${y - ponta} L ${x1} ${y} L ${x1 - direcao * ponta} ${y + ponta}`}
        fill="none"
        stroke="#F2B84B"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Ciclo: React.FC<{
  arquivo: string;
  duracao: number;
  direcao: -1 | 1;
  entraSuave: boolean;
}> = ({ arquivo, duracao, direcao, entraSuave }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidade = entraSuave
    ? interpolate(frame, [0, FUSAO * fps], [0, 1], clamp)
    : 1;
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <Video src={staticFile(`amputacao/${arquivo}`)} muted />
      <SetaPelve direcao={direcao} duracao={duracao} />
    </AbsoluteFill>
  );
};

export const Transferencia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);

  // Câmera: leve aproximação na abertura, zoom na pelve no 2º ciclo e volta ao quadro inteiro.
  const zoom =
    t < T.zoomIn
      ? interpolate(t, [0, T.protese1], [1, 1.03], {
          ...clamp,
          easing: suave,
        }) *
        interpolate(t, [T.protese1, T.protese1 + 0.6], [1, 1 / 1.03], clamp)
      : t < T.zoomOut
        ? interpolate(t, [T.zoomIn, T.zoomIn + 1], [1, ZOOM], {
            ...clamp,
            easing: suave,
          })
        : interpolate(t, [T.zoomOut, T.zoomOut + 1.2], [ZOOM, 1], {
            ...clamp,
            easing: suave,
          });

  const ciclo = (
    inicio: number,
    arquivo: string,
    duracao: number,
    direcao: -1 | 1,
    entraSuave: boolean,
  ) => (
    <Sequence from={f(inicio)} durationInFrames={f(duracao)}>
      <Ciclo
        arquivo={arquivo}
        duracao={duracao}
        direcao={direcao}
        entraSuave={entraSuave}
      />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{ scale: String(zoom), transformOrigin: "47% 100%" }}
      >
        {/* Quadro parado: abertura, transição do zoom e final */}
        <Sequence durationInFrames={f(T.protese1) + 2}>
          <Img src={staticFile("amputacao/inicio.jpg")} />
        </Sequence>
        <Sequence from={f(T.zoomIn) - 1} durationInFrames={f(1) + 2}>
          <Img src={staticFile("amputacao/inicio.jpg")} />
        </Sequence>
        <Sequence from={f(T.zoomOut) - 1}>
          <Img src={staticFile("amputacao/fim.jpg")} />
        </Sequence>
        {/* Peso para a prótese (esquerda da tela) e para a perna esquerda (direita da tela) */}
        {ciclo(T.protese1, "ciclo-protese.mp4", CICLO_PROTESE, -1, false)}
        {ciclo(T.perna1, "ciclo-perna.mp4", CICLO_PERNA, 1, true)}
        {ciclo(T.protese2, "ciclo-protese.mp4", CICLO_PROTESE, -1, false)}
        {ciclo(T.perna2, "ciclo-perna.mp4", CICLO_PERNA, 1, true)}
      </AbsoluteFill>

      {/* Logos nos cantos inferiores, como no vídeo de exemplo */}
      <Img
        src={staticFile("marca/logo-corredor.png")}
        style={{ position: "absolute", left: 36, bottom: 28, height: 150 }}
      />
      <Img
        src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")}
        style={{ position: "absolute", right: 36, bottom: 36, width: 300 }}
      />
    </AbsoluteFill>
  );
};
