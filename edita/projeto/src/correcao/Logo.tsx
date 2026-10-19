import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo ScolioFisio (PNG transparente do cliente, só girado e recortado; 1539 × 571).
// Tem partes pretas, então vai sobre um cartão branco para aparecer no fundo escuro.
// Substituiu a logo LAB ORTORIO em todos os vídeos.
const PROPORCAO = 571 / 1539;

export const Logo: React.FC<{
  left?: number;
  top?: number;
  right?: number;
  largura: number;
  inicio: number;
  fim: number;
  /** ocupa espaço no fluxo do layout em vez de ficar solta na tela */
  relativo?: boolean;
}> = ({ left, top, right, largura, inicio, fim, relativo = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = interpolate(
    t,
    [inicio, inicio + 0.5, fim - 0.5, fim],
    [0, 1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  if (opacidade === 0) return null;
  const padding = Math.round(largura * 0.045);
  const interna = largura - 2 * padding;
  return (
    <div
      style={{
        position: relativo ? "relative" : "absolute",
        left,
        top,
        right,
        width: largura,
        padding,
        borderRadius: Math.round(largura * 0.045),
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        opacity: opacidade,
      }}
    >
      <Img
        src={staticFile("marca/scoliofisio.png")}
        style={{
          display: "block",
          width: interna,
          height: interna * PROPORCAO,
        }}
      />
    </div>
  );
};
