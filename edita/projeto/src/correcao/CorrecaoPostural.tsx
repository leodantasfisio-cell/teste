import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores } from "./cores";
import { Esqueleto, type Destaques, type Pose } from "./Esqueleto";
import { fonteTexto } from "./fontes";
import { A1, A2, cena, legendas } from "./roteiro";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.16, 1, 0.3, 1);

/** 0 → 1 entre a e b (segundos), com ease. */
const rampa = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {
    ...clamp,
    easing: Easing.inOut(Easing.sin),
  });

/** 0 → 1 → 0: acende em [a, a+0.4] e apaga em [b-0.4, b]. */
const janela = (t: number, a: number, b: number) =>
  interpolate(t, [a, a + 0.4, b - 0.4, b], [0, 1, 1, 0], clamp);

// Posição do esqueleto na tela (svg 600 × 900 escalado para 560 × 840).
const ESQ = { left: (1920 - 560) / 2, top: 110, escala: 560 / 600 };
const naTela = (x: number, y: number) => ({
  x: ESQ.left + x * ESQ.escala,
  y: ESQ.top + y * ESQ.escala,
});

const calcularPose = (t: number): Pose => {
  const volta = 1 - rampa(t, cena.encerramento + 0.8, cena.encerramento + 3.5);
  return {
    crescimento:
      (14 * rampa(t, cena.cresca + 1.2, cena.cresca + 3.8) +
        6 * rampa(t, cena.terminar + 0.6, cena.terminar + 2.8)) *
      volta,
    cotovelos: rampa(t, cena.cotovelos + 3, cena.cotovelos + 5.2) * volta,
    expansaoEsquerda:
      rampa(t, cena.respirar + 1.4, cena.respirar + 4.6) * volta,
    deslocamento: -16 * rampa(t, cena.fuga + 0.3, cena.fuga + 3) * volta,
    rotacao: rampa(t, cena.girar + 0.4, cena.girar + 3) * volta,
    respiracao:
      t > cena.sustentacao && t < cena.encerramento
        ? ((1 - Math.cos((2 * Math.PI * (t - cena.sustentacao)) / 6)) / 2) * 0.6
        : 0,
  };
};

const calcularDestaques = (t: number): Destaques => ({
  pes: janela(t, cena.posicaoInicial, cena.maos),
  maos: janela(t, cena.maos, cena.cresca),
  coluna: janela(t, cena.cresca, cena.cotovelos) * 0.85,
  costelasEsquerda: janela(t, cena.respirar + 1, cena.encerramento) * 0.9,
  escapulas: janela(t, cena.terminar + 3, cena.fique) * 0.8,
});

type Passo = {
  inicio: number;
  fim: number;
  kicker: string;
  titulo: string;
  sub: string;
};

const passos: Passo[] = [
  {
    inicio: cena.posicaoInicial,
    fim: cena.maos,
    kicker: "POSIÇÃO INICIAL",
    titulo: "Sentado no banco",
    sub: "Pés bem apoiados no chão",
  },
  {
    inicio: cena.maos,
    fim: cena.cresca,
    kicker: "PASSO 1 DE 7",
    titulo: "Mãos nas coxas",
    sub: "Apoie o peso nelas",
  },
  {
    inicio: cena.cresca,
    fim: cena.cotovelos,
    kicker: "PASSO 2 DE 7",
    titulo: "Cresça",
    sub: "Estique o corpo para cima",
  },
  {
    inicio: cena.cotovelos,
    fim: cena.lombar,
    kicker: "PASSO 3 DE 7",
    titulo: "Cotovelos à frente",
    sub: "Mantém a curva do alto das costas",
  },
  {
    inicio: cena.lombar,
    fim: cena.respirar,
    kicker: "PASSO 4 DE 7",
    titulo: "Curvinha da lombar",
    sub: "Não deixe as costas retas",
  },
  {
    inicio: cena.respirar,
    fim: cena.girar,
    kicker: "PASSO 5 DE 7",
    titulo: "Respire pelo lado esquerdo",
    sub: "Encha o peito e leve o tronco para a esquerda",
  },
  {
    inicio: cena.girar,
    fim: cena.terminar,
    kicker: "PASSO 6 DE 7",
    titulo: "Gire para a esquerda",
    sub: "Devagar, sem forçar",
  },
  {
    inicio: cena.terminar,
    fim: cena.sustentacao,
    kicker: "PASSO 7 DE 7",
    titulo: "Cresça mais um pouco",
    sub: "Ombros baixos e firmes",
  },
];

export const CorrecaoPostural: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${cores.fundoLuz} 0%, ${cores.fundo} 65%)`,
        fontFamily: fonteTexto,
      }}
    >
      <Esqueleto
        pose={calcularPose(t)}
        destaques={calcularDestaques(t)}
        style={{
          position: "absolute",
          left: ESQ.left,
          top: ESQ.top,
          width: 600 * ESQ.escala,
          height: 900 * ESQ.escala,
        }}
      />

      <Lados />
      <Abertura />
      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <SetasMaos />
      <SetaCima inicio={cena.cresca + 0.6} fim={cena.cotovelos} />
      <Legendas />

      <Audio
        src={staticFile("narracao/audio1-abertura.mp3")}
        from={A1 * fps}
        premountFor={fps}
      />
      <Audio
        src={staticFile("narracao/audio2-exercicio.mp3")}
        from={A2 * fps}
        premountFor={fps}
      />
      <Audio src={staticFile("musica/fundo-calmo.wav")} volume={0.22} />
      {passos.slice(1).map((p) => (
        <Audio
          key={p.kicker}
          src={staticFile("sfx/pop.wav")}
          from={Math.round(p.inicio * fps)}
          volume={0.25}
          premountFor={fps}
        />
      ))}
    </AbsoluteFill>
  );
};

const Lados: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
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
        opacity: interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 0.8], clamp),
      }}
    >
      <span>ESQUERDO</span>
      <span>DIREITO</span>
    </div>
  );
};

const Abertura: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fim = cena.posicaoInicial - 0.1;
  const entra = (s: number) =>
    interpolate(frame, [s * fps, (s + 0.6) * fps], [0, 1], {
      ...clamp,
      easing: suave,
    });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 360,
        width: 720,
        color: cores.texto,
        opacity: interpolate(
          frame,
          [(fim - 0.4) * fps, fim * fps],
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
          opacity: entra(A1),
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
          opacity: entra(A1 + 0.2),
          translate: `0 ${(1 - entra(A1 + 0.2)) * 30}px`,
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
          opacity: entra(A1 + 5.6),
          translate: `${(1 - entra(A1 + 5.6)) * -20}px 0`,
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
  );
};

const EtiquetaPasso: React.FC<{ passo: Passo }> = ({ passo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < passo.inicio - 0.1 || t > passo.fim) return null;
  const entrada = interpolate(t, [passo.inicio, passo.inicio + 0.6], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const saida = interpolate(t, [passo.fim - 0.35, passo.fim], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 400,
        width: 600,
        color: cores.texto,
        opacity: entrada * saida,
        translate: `0 ${(1 - entrada) * 24}px`,
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
        {passo.kicker}
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          marginTop: 10,
          lineHeight: 1.05,
        }}
      >
        {passo.titulo}
      </div>
      <div
        style={{
          fontSize: 32,
          color: cores.textoSuave,
          marginTop: 14,
          lineHeight: 1.3,
        }}
      >
        {passo.sub}
      </div>
    </div>
  );
};

// Setas para baixo sobre as mãos: "apoie o peso nelas".
const SetasMaos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const a = cena.maos + 1.2;
  const opacidade = janela(t, a, cena.cresca);
  if (opacidade === 0) return null;
  const desce = interpolate(t, [a, a + 0.8], [-30, 0], {
    ...clamp,
    easing: suave,
  });
  return (
    <>
      {[183, 417].map((x) => {
        const p = naTela(x + (x < 300 ? -62 : 62), 582);
        return (
          <svg
            key={x}
            viewBox="0 0 40 60"
            style={{
              position: "absolute",
              left: p.x - 20,
              top: p.y - 70 + desce,
              width: 40,
              height: 60,
              opacity: opacidade,
            }}
          >
            <path
              d="M 20 4 L 20 50 M 6 36 L 20 52 L 34 36"
              fill="none"
              stroke={cores.destaque}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </>
  );
};

const SetaCima: React.FC<{ inicio: number; fim: number }> = ({
  inicio,
  fim,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, inicio, fim);
  if (opacidade === 0) return null;
  const cresce = interpolate(t, [inicio, inicio + 1.1], [0, 1], {
    ...clamp,
    easing: suave,
  });
  return (
    <svg
      viewBox="0 0 80 126"
      style={{
        position: "absolute",
        left: 960 - 35,
        top: 4,
        width: 70,
        height: 110,
        opacity: opacidade,
      }}
    >
      <line
        x1={40}
        y1={118}
        x2={40}
        y2={118 - 88 * cresce}
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
        transform={`translate(0 ${88 * (1 - cresce)})`}
      />
    </svg>
  );
};

const Legendas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const atual = legendas.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!atual) return null;
  const opacidade = interpolate(
    ms,
    [atual.startMs, atual.startMs + 130, atual.endMs - 130, atual.endMs],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        opacity: opacidade,
      }}
    >
      <div
        style={{
          maxWidth: 1300,
          textAlign: "center",
          backgroundColor: "rgba(0, 0, 0, 0.62)",
          color: cores.texto,
          fontSize: 40,
          fontWeight: 600,
          lineHeight: 1.3,
          padding: "12px 28px",
          borderRadius: 12,
        }}
      >
        {atual.text}
      </div>
    </div>
  );
};
