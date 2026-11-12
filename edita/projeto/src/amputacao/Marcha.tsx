import { Video } from "@remotion/media";
import { fonteTexto } from "../correcao/fontes";
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

// Amputação — marcha estacionária com apoio, 3 repetições por perna.
// Clipe do Gemini (Veo) espelhado (prótese na perna direita = esquerda da tela),
// cortado em um ciclo da prótese e um da perna sadia, desacelerados 2,2× com interpolação.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.inOut(Easing.sin);

const CICLO_PROTESE = 3.13;
const CICLO_PERNA = 2.57;
const FUSAO = 0.3;
const CAPA = 3;
const POSICAO_INICIAL = 4;
const REPETICOES = 3;
const FINAL = 3;

type Passo = { inicio: number; arquivo: string; duracao: number; lado: -1 | 1; rep: number };

const PASSOS: Passo[] = (() => {
  const lista: Passo[] = [];
  let t = CAPA + POSICAO_INICIAL;
  for (let rep = 1; rep <= REPETICOES; rep++) {
    lista.push({ inicio: t, arquivo: "ciclo-protese.mp4", duracao: CICLO_PROTESE, lado: -1, rep });
    t += CICLO_PROTESE - FUSAO;
    lista.push({ inicio: t, arquivo: "ciclo-perna.mp4", duracao: CICLO_PERNA, lado: 1, rep });
    t += CICLO_PERNA - FUSAO;
  }
  return lista;
})();

const FIM_PASSOS = PASSOS[PASSOS.length - 1].inicio + CICLO_PERNA;
export const DURACAO_MARCHA = Math.ceil(FIM_PASSOS + FINAL);

/** Posição dos joelhos no quadro 1920×1080 (prótese à esquerda da tela). */
const JOELHO = { "-1": { x: 840, y: 830 }, "1": { x: 1040, y: 830 } } as const;

// Seta para cima ao lado do joelho que sobe, crescendo com a elevação.
const SetaJoelho: React.FC<{ lado: -1 | 1; duracao: number }> = ({ lado, duracao }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const u = interpolate(t, [0.2, duracao * 0.4, duracao * 0.6, duracao - 0.2], [0, 1, 1, 0], {
    ...clamp,
    easing: suave,
  });
  if (u < 0.02) return null;
  const { x: xj, y: yj } = JOELHO[String(lado) as "-1" | "1"];
  const x = xj + lado * 110;
  const y0 = yj + 40;
  const y1 = y0 - 60 - 90 * u;
  const p = 20;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: Math.min(1, u * 3) * 0.9 }}>
      <line x1={x} y1={y0} x2={x} y2={y1} stroke="#F2B84B" strokeWidth={8} strokeLinecap="round" />
      <path
        d={`M ${x - p} ${y1 + p} L ${x} ${y1} L ${x + p} ${y1 + p}`}
        fill="none"
        stroke="#F2B84B"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Ciclo: React.FC<{ passo: Passo; primeiro: boolean }> = ({ passo, primeiro }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidade = primeiro ? 1 : interpolate(frame, [0, FUSAO * fps], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <Video src={staticFile(`amputacao/marcha/${passo.arquivo}`)} muted />
      <SetaJoelho lado={passo.lado} duracao={passo.duracao} />
    </AbsoluteFill>
  );
};

// Contador discreto no alto: qual perna e qual repetição.
const Contador: React.FC<{ passo: Passo }> = ({ passo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(frame, [0, 0.3 * fps], [0, 1], clamp);
  return (
    <div
      style={{
        position: "absolute",
        top: 40,
        left: 40,
        display: "flex",
        opacity: op,
        fontFamily: fonteTexto,
      }}
    >
      <div
        style={{
          padding: "14px 34px",
          borderRadius: 40,
          backgroundColor: "rgba(0,0,0,0.55)",
          color: "#FFF",
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {passo.lado === -1 ? "Prótese" : "Perna esquerda"}
        <span style={{ color: "#F2B84B", marginLeft: 18 }}>{passo.rep}/3</span>
      </div>
    </div>
  );
};

export const Marcha: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);

  // Aproximação nas pernas durante a 2ª repetição.
  const rep2 = PASSOS[2].inicio;
  const rep3 = PASSOS[4].inicio;
  const zoom =
    interpolate(t, [rep2 - 0.2, rep2 + 0.8], [1, 1.35], { ...clamp, easing: suave }) *
    interpolate(t, [rep3 - 0.2, rep3 + 0.8], [1, 1 / 1.35], { ...clamp, easing: suave });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ scale: String(zoom), transformOrigin: "48% 100%" }}>
        <Sequence durationInFrames={f(PASSOS[0].inicio) + 2}>
          <Img src={staticFile("amputacao/marcha/inicio.jpg")} />
        </Sequence>
        <Sequence from={f(FIM_PASSOS) - 1}>
          <Img src={staticFile("amputacao/marcha/inicio.jpg")} />
        </Sequence>
        {PASSOS.map((p, i) => (
          <Sequence key={i} from={f(p.inicio)} durationInFrames={f(p.duracao)}>
            <Ciclo passo={p} primeiro={i === 0} />
          </Sequence>
        ))}
      </AbsoluteFill>

      {PASSOS.map((p, i) => (
        <Sequence key={i} from={f(p.inicio)} durationInFrames={f(p.duracao - FUSAO)}>
          <Contador passo={p} />
        </Sequence>
      ))}

      <AbsoluteFill style={{ opacity: interpolate(t, [CAPA - 0.4, CAPA + 0.2], [0, 1], clamp) }}>
        <Img src={staticFile("marca/logo-corredor.png")} style={{ position: "absolute", left: 36, bottom: 28, height: 150 }} />
        <Img
          src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")}
          style={{ position: "absolute", right: 36, bottom: 36, width: 300 }}
        />
      </AbsoluteFill>
      <Sequence durationInFrames={f(CAPA)}>
        <Capa />
      </Sequence>
    </AbsoluteFill>
  );
};

const Capa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const entra = (a: number) =>
    interpolate(t, [a, a + 0.6], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sai = interpolate(t, [CAPA - 0.5, CAPA], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: sai, fontFamily: fonteTexto }}>
      <Img
        src={staticFile("amputacao/marcha/inicio.jpg")}
        style={{ width: "100%", height: "100%", filter: "blur(14px) brightness(0.45)", scale: "1.08" }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", color: "#FFF", textAlign: "center" }}>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 8, color: "#F2B84B", opacity: entra(0.1) }}>
          EXERCÍCIO
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 18,
            opacity: entra(0.25),
            translate: `0 ${(1 - entra(0.25)) * 30}px`,
          }}
        >
          Marcha estacionária
          <br />
          com apoio
        </div>
        <div style={{ fontSize: 38, fontWeight: 500, color: "#E6E6E6", marginTop: 26, opacity: entra(0.6) }}>
          Amputação transtibial · 3 repetições em cada perna
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 60,
            marginTop: 60,
            padding: "22px 48px",
            borderRadius: 26,
            backgroundColor: "rgba(255,255,255,0.94)",
            opacity: entra(0.9),
          }}
        >
          <Img src={staticFile("marca/logo-corredor.png")} style={{ height: 170 }} />
          <Img src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")} style={{ width: 380 }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
