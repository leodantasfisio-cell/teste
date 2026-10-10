import {
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Logo LAB ORTORIO sem o fundo branco (scripts/logo_sem_fundo.py); desenho e cores originais.
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
      src={staticFile("marca/logo-labortorio-sem-fundo.png")}
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
