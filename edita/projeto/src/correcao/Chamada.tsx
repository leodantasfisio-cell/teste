import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { cores } from "./cores";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Etiqueta com linha apontando para uma parte do corpo (coordenadas de tela).
export const Chamada: React.FC<{
  texto: string;
  /** ponto do corpo */
  alvo: { x: number; y: number };
  /** ponta da linha junto da etiqueta; a etiqueta fica à esquerda deste ponto */
  ancora: { x: number; y: number };
  inicio: number;
  fim: number;
}> = ({ texto, alvo, ancora, inicio, fim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = interpolate(
    t,
    [inicio, inicio + 0.4, fim - 0.4, fim],
    [0, 1, 1, 0],
    clamp,
  );
  if (opacidade === 0) return null;
  const linha = interpolate(t, [inicio + 0.2, inicio + 0.9], [0, 1], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const fimX = ancora.x + (alvo.x - ancora.x) * linha;
  const fimY = ancora.y + (alvo.y - ancora.y) * linha;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: opacidade }}>
      <svg
        width={1920}
        height={1080}
        style={{ position: "absolute", inset: 0 }}
      >
        <line
          x1={ancora.x}
          y1={ancora.y}
          x2={fimX}
          y2={fimY}
          stroke={cores.destaque}
          strokeWidth={4}
          strokeLinecap="round"
        />
        <circle cx={alvo.x} cy={alvo.y} r={9 * linha} fill={cores.destaque} />
        <circle
          cx={alvo.x}
          cy={alvo.y}
          r={18 * linha}
          fill="none"
          stroke={cores.destaque}
          strokeWidth={3}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 1920 - ancora.x + 12,
          top: ancora.y,
          translate: "0 -50%",
          whiteSpace: "nowrap",
          padding: "10px 20px",
          borderRadius: 999,
          backgroundColor: "rgba(20, 20, 20, 0.85)",
          border: `3px solid ${cores.destaque}`,
          color: cores.texto,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        {texto}
      </div>
    </div>
  );
};
