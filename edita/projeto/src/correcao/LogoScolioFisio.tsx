import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo ScolioFisio (PNG transparente do cliente, só girado e recortado). Tem partes pretas,
// então vai sobre um cartão branco para aparecer no fundo escuro sem alterar a logo.
const PROPORCAO = 571 / 1539;

export const LogoScolioFisio: React.FC<{
  left: number;
  top: number;
  largura: number;
  inicio: number;
  fim: number;
}> = ({ left, top, largura, inicio, fim }) => {
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
  const entra = interpolate(t, [inicio, inicio + 0.6], [16, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const padding = 18;
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: largura,
        padding,
        borderRadius: 18,
        backgroundColor: "#FFFFFF",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.35)",
        opacity: opacidade,
        translate: `0 ${entra}px`,
      }}
    >
      <Img
        src={staticFile("marca/scoliofisio.png")}
        style={{
          display: "block",
          width: largura - 2 * padding,
          height: (largura - 2 * padding) * PROPORCAO,
        }}
      />
    </div>
  );
};
