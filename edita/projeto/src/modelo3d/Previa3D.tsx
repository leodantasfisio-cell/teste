import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores } from "../correcao/cores";
import { fonteTexto } from "../correcao/fontes";
import { Esqueleto3D } from "./Esqueleto3D";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.inOut(Easing.sin);

// Prévia de 14 s: esqueleto 3D sentado, "cresça" (1–5 s) e "tronco para a esquerda" (6–11 s).
export const Previa3D: React.FC<{ vista?: "costas" | "lado" }> = ({
  vista = "costas",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const crescer = interpolate(t, [1.2, 4.2], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const deslocar = interpolate(t, [6.2, 9.4], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const etiqueta =
    t < 5.6
      ? { kicker: "PASSO 2", titulo: "Cresça" }
      : { kicker: "PASSO 5", titulo: "Tronco para a esquerda" };
  const opEtiqueta =
    interpolate(t, [0.4, 0.9], [0, 1], clamp) *
    interpolate(t, [5.2, 5.6, 6.0, 6.4], [1, 0, 0, 1], clamp);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      <Esqueleto3D pose={{ crescer, deslocar, girar: 0 }} vista={vista} />
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 420,
          color: cores.texto,
          opacity: opEtiqueta,
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            color: cores.destaque,
          }}
        >
          {etiqueta.kicker}
        </div>
        <div style={{ fontSize: 60, fontWeight: 800, marginTop: 10 }}>
          {etiqueta.titulo}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 120,
          bottom: 60,
          color: cores.textoSuave,
          fontSize: 24,
        }}
      >
        Modelo 3D: “Lowpoly Human Skeleton (Rigged)” por Void · CC BY 4.0
      </div>
    </AbsoluteFill>
  );
};
