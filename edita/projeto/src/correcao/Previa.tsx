import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores } from "./cores";
import { Esqueleto } from "./Esqueleto";
import { fonteTexto } from "./fontes";

const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
const suave = Easing.bezier(0.16, 1, 0.3, 1);

// Prévia de estilo: cena 1 (abertura) e cena 3 (crescimento axial).
// Sem cortes: o esqueleto fica fixo e só os gráficos mudam.
export const Previa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cena3 = 5 * fps;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${cores.fundoLuz} 0%, ${cores.fundo} 65%)`,
        fontFamily: fonteTexto,
      }}
    >
      <Esqueleto
        crescimento={interpolate(
          frame,
          [cena3 + 1 * fps, cena3 + 3 * fps],
          [0, 16],
          {
            ...clamp,
            easing: Easing.inOut(Easing.sin),
          },
        )}
        destaqueColuna={interpolate(
          frame,
          [cena3 + 0.3 * fps, cena3 + 1 * fps],
          [0, 0.85],
          clamp,
        )}
        style={{
          position: "absolute",
          left: (1920 - 560) / 2,
          top: 110,
          width: 560,
          height: 840,
        }}
      />

      {/* Lados, reforçando a vista de costas */}
      <div
        style={{
          position: "absolute",
          top: 780,
          left: 590,
          width: 740,
          display: "flex",
          justifyContent: "space-between",
          color: cores.textoSuave,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 4,
          opacity: interpolate(frame, [1 * fps, 1.6 * fps], [0, 0.8], clamp),
        }}
      >
        <span>ESQUERDO</span>
        <span>DIREITO</span>
      </div>

      {/* Cena 1: título e aviso */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 360,
          width: 720,
          color: cores.texto,
          opacity: interpolate(
            frame,
            [cena3 - 0.4 * fps, cena3],
            [1, 0],
            clamp,
          ),
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            color: cores.destaque,
            opacity: interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], clamp),
          }}
        >
          EXERCÍCIO
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 12,
            opacity: interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], clamp),
            translate: `0 ${interpolate(frame, [0.5 * fps, 1.2 * fps], [30, 0], { ...clamp, easing: suave })}px`,
          }}
        >
          Correção postural
          <br />
          <span style={{ color: cores.destaque }}>lado esquerdo</span>
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            marginTop: 36,
            padding: "14px 22px",
            borderRadius: 999,
            backgroundColor: "rgba(255, 90, 90, 0.16)",
            border: "2px solid #FF6B6B",
            fontSize: 30,
            fontWeight: 600,
            opacity: interpolate(frame, [2 * fps, 2.6 * fps], [0, 1], clamp),
            translate: `${interpolate(frame, [2 * fps, 2.6 * fps], [-20, 0], { ...clamp, easing: suave })}px 0`,
          }}
        >
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: "#FF6B6B",
              color: cores.fundo,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            !
          </span>
          Pare se sentir dor
        </div>
      </div>

      {/* Cena 3: etiqueta do passo */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: 400,
          color: cores.texto,
          opacity: interpolate(
            frame,
            [cena3 + 0.2 * fps, cena3 + 0.8 * fps],
            [0, 1],
            clamp,
          ),
          translate: `0 ${interpolate(frame, [cena3 + 0.2 * fps, cena3 + 0.8 * fps], [24, 0], { ...clamp, easing: suave })}px`,
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
          PASSO 2 DE 7
        </div>
        <div style={{ fontSize: 64, fontWeight: 800, marginTop: 10 }}>
          Crescimento axial
        </div>
        <div style={{ fontSize: 32, color: cores.textoSuave, marginTop: 10 }}>
          Estique a coluna para cima
        </div>
      </div>

      {/* Cena 3: seta vertical sobre a cabeça */}
      <svg
        viewBox="0 0 80 126"
        style={{
          position: "absolute",
          left: 960 - 35,
          top: 4,
          width: 70,
          height: 110,
          opacity: interpolate(
            frame,
            [cena3 + 0.5 * fps, cena3 + 0.9 * fps],
            [0, 1],
            clamp,
          ),
        }}
      >
        <line
          x1={40}
          y1={118}
          x2={40}
          y2={interpolate(
            frame,
            [cena3 + 0.5 * fps, cena3 + 1.6 * fps],
            [118, 30],
            { ...clamp, easing: suave },
          )}
          stroke={cores.destaque}
          strokeWidth={10}
          strokeLinecap="round"
        />
        <path
          d="M 14 52 L 40 16 L 66 52"
          fill="none"
          stroke={cores.destaque}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
          transform={`translate(0 ${interpolate(
            frame,
            [cena3 + 0.5 * fps, cena3 + 1.6 * fps],
            [88, 0],
            {
              ...clamp,
              easing: suave,
            },
          )})`}
        />
      </svg>

      <Legenda
        inicio={0.5}
        fim={2.8}
        texto="Exercício de correção postural para o lado esquerdo."
      />
      <Legenda
        inicio={2.8}
        fim={5}
        texto="Se sentir dor, interrompa o exercício."
      />
      <Legenda inicio={5.3} fim={7} texto="Agora, cresça a coluna." />
      <Legenda
        inicio={7}
        fim={10}
        texto="Estique bem o corpo para cima, como se fosse tocar o teto."
      />
    </AbsoluteFill>
  );
};

// Legenda provisória: o tempo real virá da transcrição local da narração.
const Legenda: React.FC<{ inicio: number; fim: number; texto: string }> = ({
  inicio,
  fim,
  texto,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidade = interpolate(
    frame,
    [inicio * fps, inicio * fps + 5, fim * fps - 5, fim * fps],
    [0, 1, 1, 0],
    clamp,
  );
  if (opacidade === 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 56,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: opacidade,
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          color: cores.texto,
          fontSize: 40,
          fontWeight: 600,
          padding: "12px 28px",
          borderRadius: 12,
        }}
      >
        {texto}
      </div>
    </div>
  );
};
