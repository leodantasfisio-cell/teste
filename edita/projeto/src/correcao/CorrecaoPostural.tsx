import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { cores } from "./cores";
import { EsqueletoFoto, naFoto, type DestaquesFoto } from "./EsqueletoFoto";
import { fonteTexto } from "./fontes";
import { A1, A2, A3, AVISO_10, AVISO_30, cena, legendas } from "./roteiro";

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

const calcularDestaques = (t: number): DestaquesFoto => ({
  pes: janela(t, cena.posicaoInicial, cena.maos),
  maos: janela(t, cena.maos, cena.cresca),
  coluna: janela(t, cena.cresca, cena.cotovelos) * 0.85,
  costelasEsquerda: janela(t, cena.respirar + 1, cena.encerramento) * 0.9,
  escapulas: janela(t, cena.terminar + 3, cena.fique) * 0.8,
});

const calcularCrescimento = (t: number) =>
  (0.7 * rampa(t, cena.cresca + 1.2, cena.cresca + 3.8) +
    0.3 * rampa(t, cena.terminar + 0.6, cena.terminar + 2.8)) *
  (1 - rampa(t, cena.encerramento + 0.8, cena.encerramento + 3.5));

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

  // Abertura com a coluna curva; dissolve para a coluna alinhada na posição inicial.
  const curva =
    1 - rampa(t, cena.posicaoInicial - 0.6, cena.posicaoInicial + 0.9);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      <EsqueletoFoto
        imagem="costas-neutro.jpg"
        destaques={calcularDestaques(t)}
        crescimento={calcularCrescimento(t)}
      />
      {curva > 0 ? (
        <AbsoluteFill style={{ opacity: curva }}>
          <EsqueletoFoto imagem="costas-curva-a.jpg" />
        </AbsoluteFill>
      ) : null}

      <Lados />
      <Abertura />
      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <SetasMaos />
      <SetaCima inicio={cena.cresca + 0.6} fim={cena.cotovelos} />
      <EviteFaca inicio={cena.cresca + 0.8} fim={cena.cotovelos} />
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
      <Audio
        src={staticFile("narracao/aviso-faltam-30.mp3")}
        from={Math.round(AVISO_30 * fps)}
        premountFor={fps}
      />
      <Audio
        src={staticFile("narracao/aviso-faltam-10.mp3")}
        from={Math.round(AVISO_10 * fps)}
        premountFor={fps}
      />
      <Audio
        src={staticFile("narracao/audio3-encerramento.mp3")}
        from={Math.round(A3 * fps)}
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
        top: 725,
        left: 560,
        width: 800,
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
        width: 620,
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
          fontSize: 64,
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
        width: 580,
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
          fontSize: 60,
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

// Setas para baixo ao lado das mãos: "apoie o peso nelas".
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
      {[770, 1230].map((x) => {
        const p = naFoto(x, 690);
        return (
          <svg
            key={x}
            viewBox="0 0 40 60"
            style={{
              position: "absolute",
              left: p.x - 20,
              top: p.y - 80 + desce,
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
        top: 0,
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

// Vista de lado: "evite" (imagem curvada) × "faça" (lateral correta).
// Recorte da imagem lateral (2000 × 1116): x 600–1280, y 30–1110.
const RECORTE = { x: 600, y: 30, largura: 680, altura: 1080 };
const CARTAO = 290;

const QuadroLado: React.FC<{ imagem: string | null }> = ({ imagem }) => {
  const escala = CARTAO / RECORTE.largura;
  const altura = RECORTE.altura * escala;
  if (!imagem) {
    return (
      <div
        style={{
          width: CARTAO,
          height: altura,
          borderRadius: 16,
          border: `3px dashed ${cores.textoSuave}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: cores.textoSuave,
          fontSize: 24,
          lineHeight: 1.4,
          padding: 20,
        }}
      >
        Imagem lateral correta
        <br />
        (aguardando)
      </div>
    );
  }
  return (
    <div
      style={{
        width: CARTAO,
        height: altura,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Img
        src={staticFile(`esqueleto/${imagem}`)}
        style={{
          position: "absolute",
          width: 2000 * escala,
          height: 1116 * escala,
          left: -RECORTE.x * escala,
          top: -RECORTE.y * escala,
        }}
      />
    </div>
  );
};

const Selo: React.FC<{ tipo: "evite" | "faca" }> = ({ tipo }) => {
  const cor = tipo === "evite" ? "#FF6B6B" : cores.verde;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 14,
        color: cor,
        fontSize: 30,
        fontWeight: 800,
        letterSpacing: 3,
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: cor,
          color: cores.fundo,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
        }}
      >
        {tipo === "evite" ? "✕" : "✓"}
      </span>
      {tipo === "evite" ? "EVITE" : "FAÇA"}
    </div>
  );
};

const EviteFaca: React.FC<{ inicio: number; fim: number }> = ({
  inicio,
  fim,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, inicio, fim);
  if (opacidade === 0) return null;
  const entrada = (atraso: number) =>
    interpolate(t, [inicio + atraso, inicio + atraso + 0.7], [0, 1], {
      ...clamp,
      easing: suave,
    });
  return (
    <div
      style={{
        position: "absolute",
        left: 1235,
        top: 190,
        display: "flex",
        gap: 30,
        opacity: opacidade,
      }}
    >
      <div
        style={{
          opacity: entrada(0),
          translate: `${(1 - entrada(0)) * 40}px 0`,
        }}
      >
        <Selo tipo="evite" />
        <QuadroLado imagem="lado-inicial.jpg" />
      </div>
      <div
        style={{
          opacity: entrada(0.5),
          translate: `${(1 - entrada(0.5)) * 40}px 0`,
        }}
      >
        <Selo tipo="faca" />
        <QuadroLado imagem={null} />
      </div>
    </div>
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
        bottom: 40,
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
          backgroundColor: "rgba(0, 0, 0, 0.66)",
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
