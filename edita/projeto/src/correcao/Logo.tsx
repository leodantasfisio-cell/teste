import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo LAB ORTORIO sem fundo, recortada pelo usuário (1365 × 483); usada sem alteração.
const PROPORCAO = 483 / 1365;

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
  return (
    <Img
      src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")}
      style={{
        position: relativo ? "relative" : "absolute",
        display: "block",
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
