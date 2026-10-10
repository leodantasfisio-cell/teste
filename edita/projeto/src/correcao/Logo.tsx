import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo LAB ORTORIO: usada exatamente como veio (973 × 344, fundo branco), só posicionada e escalada.
const PROPORCAO = 344 / 973;

export const Logo: React.FC<{
  left?: number;
  top?: number;
  right?: number;
  largura: number;
  inicio: number;
  fim: number;
}> = ({ left, top, right, largura, inicio, fim }) => {
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
  return (
    <Img
      src={staticFile("marca/logo-labortorio.jpg")}
      style={{
        position: "absolute",
        left,
        top,
        right,
        width: largura,
        height: largura * PROPORCAO,
        opacity: opacidade,
      }}
    />
  );
};
