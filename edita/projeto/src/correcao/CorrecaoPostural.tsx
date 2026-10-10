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
import { Chamada } from "./Chamada";
import { cores } from "./cores";
import { EsqueletoFoto, naFoto, type DestaquesFoto } from "./EsqueletoFoto";
import { fonteTexto } from "./fontes";
import { Logo } from "./Logo";
import {
  A1,
  A2,
  A3,
  AVISO_10,
  AVISO_30,
  SUST_FIM,
  SUST_INICIO,
  cena,
  legendas,
} from "./roteiro";

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
  coluna: janela(t, cena.cresca, cena.cotovelos),
  costelasEsquerda: janela(t, cena.respirar + 1, cena.encerramento) * 0.9,
  escapulas: janela(t, cena.terminar + 3, cena.fique),
  cotovelos: janela(t, cena.cotovelos + 2.5, cena.lombar),
  lombar: janela(t, cena.lombar + 1.5, cena.respirar),
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
    fim: cena.fique,
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
      {ladoSustentacao(t) > 0 ? (
        <AbsoluteFill style={{ opacity: ladoSustentacao(t) }}>
          <EsqueletoFoto imagem="lado-correto.jpg" />
        </AbsoluteFill>
      ) : null}
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
      <EviteFaca inicio={cena.cresca + 0.8} fim={cena.respirar} />
      <EviteFaca inicio={cena.terminar + 0.8} fim={cena.sustentacao} />
      <SetaCima inicio={cena.terminar + 0.4} fim={cena.fique} />
      <SetaLado />
      <SetaGiro />
      <Cronometro />
      <Encerramento />
      <Chamada
        texto="Cotovelos um pouco à frente"
        alvo={naFoto(828, 555)}
        ancora={{ x: 735, y: 680 }}
        inicio={cena.cotovelos + 3}
        fim={cena.lombar}
      />
      <Chamada
        texto="Curvinha natural da lombar"
        alvo={naFoto(1000, 600)}
        ancora={{ x: 760, y: 680 }}
        inicio={cena.lombar + 2}
        fim={cena.respirar}
      />
      <Chamada
        texto="Encha este lado"
        alvo={naFoto(905, 450)}
        ancora={{ x: 760, y: 250 }}
        inicio={cena.respirar + 1.4}
        fim={cena.fuga + 0.2}
      />
      <Chamada
        texto="Ombros baixos"
        alvo={naFoto(890, 300)}
        ancora={{ x: 760, y: 250 }}
        inicio={cena.terminar + 3}
        fim={cena.fique}
      />
      <LinhasChao />
      <Chamada
        texto="Pés firmes no chão"
        alvo={naFoto(815, 1035)}
        ancora={{ x: 690, y: 880 }}
        inicio={cena.posicaoInicial + 0.5}
        fim={cena.maos}
      />
      <Chamada
        texto="Mãos apoiadas nas coxas"
        alvo={naFoto(835, 690)}
        ancora={{ x: 720, y: 660 }}
        inicio={cena.maos + 0.6}
        fim={cena.cresca}
      />
      <Chamada
        texto="Coluna alongada"
        alvo={naFoto(1000, 360)}
        ancora={{ x: 800, y: 280 }}
        inicio={cena.cresca + 1}
        fim={cena.cotovelos}
      />
      <Logo
        left={120}
        top={160}
        largura={440}
        inicio={A1}
        fim={cena.posicaoInicial - 0.1}
      />
      <Logo
        right={40}
        top={34}
        largura={230}
        inicio={cena.posicaoInicial}
        fim={cena.encerramento}
      />
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
      <Audio
        src={staticFile("sfx/ding.wav")}
        from={Math.round(SUST_FIM * fps)}
        volume={0.3}
        premountFor={fps}
      />
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
        // Somem quando a vista de lado aparece e no convite final.
        opacity:
          interpolate(frame, [1.2 * fps, 1.8 * fps], [0, 0.8], clamp) *
          (1 - ladoSustentacao(frame / fps)) *
          interpolate(
            frame / fps,
            [cena.inscreva - 0.5, cena.inscreva],
            [1, 0],
            clamp,
          ),
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

const QuadroLado: React.FC<{ imagem: string; cor: string }> = ({
  imagem,
  cor,
}) => {
  const escala = CARTAO / RECORTE.largura;
  return (
    <div
      style={{
        width: CARTAO,
        height: RECORTE.altura * escala,
        borderRadius: 16,
        overflow: "hidden",
        position: "relative",
        border: `3px solid ${cor}`,
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
        <QuadroLado imagem="lado-inicial.jpg" cor="#FF6B6B" />
      </div>
      <div
        style={{
          opacity: entrada(0.5),
          translate: `${(1 - entrada(0.5)) * 40}px 0`,
        }}
      >
        <Selo tipo="faca" />
        <QuadroLado imagem="lado-correto.jpg" cor={cores.verde} />
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

// Linhas de contato com o chão sob os pés: "pés firmes no chão".
const LinhasChao: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const forte = janela(t, cena.posicaoInicial + 0.3, cena.maos);
  const lembrete = janela(t, cena.maos, cena.encerramento) * 0.35;
  const opacidade = Math.max(forte, lembrete) * (1 - ladoSustentacao(t));
  if (opacidade === 0) return null;
  const abre = interpolate(
    t,
    [cena.posicaoInicial + 0.3, cena.posicaoInicial + 1.1],
    [0, 1],
    {
      ...clamp,
      easing: suave,
    },
  );
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, opacity: opacidade }}
    >
      {[820, 1180].map((x) => {
        const c = naFoto(x, 1050);
        const meia = 55 * abre;
        return (
          <line
            key={x}
            x1={c.x - meia}
            x2={c.x + meia}
            y1={c.y}
            y2={c.y}
            stroke={cores.destaque}
            strokeWidth={6}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 8px rgba(242, 184, 75, 0.9))" }}
          />
        );
      })}
    </svg>
  );
};

/** Na sustentação, a vista de lado aparece de 15 a 30 s e de 45 a 60 s. */
const ladoSustentacao = (t: number) =>
  janela(t, SUST_INICIO + 15, SUST_INICIO + 30) +
  janela(t, SUST_INICIO + 45, SUST_FIM);

// Seta horizontal para a esquerda: "leve o tronco para o lado esquerdo".
const SetaLado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, cena.fuga, cena.girar);
  if (opacidade === 0) return null;
  const anda = interpolate(t, [cena.fuga, cena.fuga + 1.2], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const y = 300;
  const x0 = 1060;
  const x1 = 1060 - 230 * anda;
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, opacity: opacidade }}
    >
      <line
        x1={x0}
        y1={y}
        x2={x1}
        y2={y}
        stroke={cores.azul}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1 + 30} ${y - 26} L ${x1} ${y} L ${x1 + 30} ${y + 26}`}
        fill="none"
        stroke={cores.azul}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Seta curva sobre os ombros: "gire o tronco para a esquerda".
// Visto de costas, o lado de trás da elipse anda da direita para a esquerda.
const SetaGiro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, cena.girar, cena.terminar);
  if (opacidade === 0) return null;
  const anda = interpolate(t, [cena.girar + 0.2, cena.girar + 1.6], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const cx = 960;
  const cy = 330;
  const rx = 200;
  const ry = 50;
  // Arco superior, de 20° (direita) até 20° + 140° * anda.
  const pontos = Array.from({ length: 40 }, (_, i) => {
    const a = ((-20 - 140 * anda * (i / 39)) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
  const [px, py] = pontos[pontos.length - 1];
  const [qx, qy] = pontos[pontos.length - 2];
  const ang = Math.atan2(py - qy, px - qx);
  const ponta = (d: number) =>
    `${px - 30 * Math.cos(ang + d)} ${py - 30 * Math.sin(ang + d)}`;
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, opacity: opacidade }}
    >
      <polyline
        points={pontos.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {anda > 0.05 ? (
        <path
          d={`M ${ponta(0.5)} L ${px} ${py} L ${ponta(-0.5)}`}
          fill="none"
          stroke={cores.destaque}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};

// Cronômetro da sustentação: aparece em "Fique nessa posição" e conta 60 → 0.
const Cronometro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, cena.fique, cena.encerramento + 0.6);
  if (opacidade === 0) return null;
  const restante = Math.max(0, Math.min(60, SUST_FIM - t));
  const segundos = Math.ceil(restante);
  const texto = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;
  const progresso = restante / 60;
  const r = 130;
  const volta = 2 * Math.PI * r;
  const entrada = interpolate(t, [cena.fique, cena.fique + 0.6], [0, 1], {
    ...clamp,
    easing: suave,
  });
  // Muda a frase a cada 10 s para a tela nunca ficar parada.
  const frases = [
    "Continue respirando",
    "Cresça em direção ao teto",
    "Encha o lado esquerdo",
    "Ombros baixos",
    "Pés firmes no chão",
    "Quase lá!",
  ];
  const indice = Math.min(5, Math.max(0, Math.floor((t - SUST_INICIO) / 10)));
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 250,
        width: 560,
        color: cores.texto,
        opacity: opacidade * entrada,
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
        SEGURE A POSIÇÃO
      </div>
      <div
        style={{ position: "relative", width: 320, height: 320, marginTop: 24 }}
      >
        <svg
          width={320}
          height={320}
          style={{ position: "absolute", inset: 0 }}
        >
          <circle
            cx={160}
            cy={160}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={18}
          />
          <circle
            cx={160}
            cy={160}
            r={r}
            fill="none"
            stroke={cores.destaque}
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={volta}
            strokeDashoffset={volta * (1 - progresso)}
            transform="rotate(-90 160 160)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 800,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {texto}
        </div>
      </div>
      <div style={{ fontSize: 34, color: cores.textoSuave, marginTop: 24 }}>
        {t < SUST_INICIO ? frases[0] : frases[indice]}
      </div>
    </div>
  );
};

// Encerramento: "Muito bem!", logo grande e convite para se inscrever.
const Encerramento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < A3 + 2) return null;
  const entra = (s: number) =>
    interpolate(t, [s, s + 0.6], [0, 1], { ...clamp, easing: suave });
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 300,
        width: 640,
        color: cores.texto,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          opacity: entra(A3 + 2.1),
          translate: `0 ${(1 - entra(A3 + 2.1)) * 24}px`,
        }}
      >
        Muito bem!
      </div>
      <div style={{ marginTop: 30, opacity: entra(cena.inscreva) }}>
        <Logo
          left={0}
          top={0}
          largura={460}
          inicio={cena.inscreva}
          fim={cena.inscreva + 60}
          relativo
        />
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          marginTop: 40,
          padding: "18px 34px",
          borderRadius: 999,
          backgroundColor: "#E53935",
          fontSize: 38,
          fontWeight: 800,
          opacity: entra(cena.inscreva + 0.8),
          translate: `0 ${(1 - entra(cena.inscreva + 0.8)) * 24}px`,
        }}
      >
        Inscreva-se no canal
      </div>
    </div>
  );
};
