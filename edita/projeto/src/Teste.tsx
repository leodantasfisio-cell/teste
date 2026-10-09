import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// Fonte guardada em public/fonts (OFL) para o render não depender de internet.
// Com internet, também dá para usar: loadFont() de "@remotion/google-fonts/Anton".
const fontFamily = "Anton";
const fonte = new FontFace(
  fontFamily,
  `url(${staticFile("fonts/Anton-latin.woff2")}) format("woff2")`,
);
const esperaFonte = delayRender("Carregando fonte Anton");
fonte
  .load()
  .then(() => {
    document.fonts.add(fonte);
    continueRender(esperaFonte);
  })
  .catch((err) => cancelRender(err));

const LETRAS = ["E", "D", "I", "T", "A"];

// Teste de 5 s: letras entram em cascata, faixa de destaque cresce,
// conjunto se aproxima levemente e sai com fade no fim.
export const Teste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0B0B0F",
        justifyContent: "center",
        alignItems: "center",
        opacity: interpolate(
          frame,
          [durationInFrames - 0.5 * fps, durationInFrames],
          [1, 0],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        ),
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily,
          fontSize: 330,
          lineHeight: 1,
          color: "#FFFFFF",
          scale: interpolate(frame, [0, durationInFrames], [1, 1.08], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {LETRAS.map((letra, i) => {
          const inicio = 0.2 * fps + i * 0.12 * fps;
          const entrada = interpolate(
            frame,
            [inicio, inicio + 0.6 * fps],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          );
          return (
            <span
              key={letra + i}
              style={{
                display: "inline-block",
                opacity: entrada,
                translate: `0 ${(1 - entrada) * 220}px`,
              }}
            >
              {letra}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 40,
          height: 18,
          width: 700,
          backgroundColor: "#FF3D3D",
          transformOrigin: "left",
          scale: `${interpolate(frame, [1.1 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          })} 1`,
        }}
      />
    </AbsoluteFill>
  );
};
