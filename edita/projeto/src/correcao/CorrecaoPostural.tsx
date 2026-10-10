import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Esqueleto3D,
  type Destaques3D,
  type Pose3D,
  type Setas3D,
} from "../modelo3d/Esqueleto3D";
import { Chamada } from "./Chamada";
import { cores } from "./cores";
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

/** Quanto a câmera está de lado (0 = costas, 1 = lado esquerdo): na sustentação, de 15 a 30 s e de 45 a 60 s. */
const ladoSustentacao = (t: number) => {
  const gira = (a: number, b: number) =>
    rampa(t, a, a + 1.4) - rampa(t, b - 1.4, b);
  return (
    gira(SUST_INICIO + 15, SUST_INICIO + 30) +
    gira(SUST_INICIO + 45, SUST_FIM + 0.8)
  );
};

const calcularPose = (t: number): Pose3D => {
  // Tudo volta à posição inicial depois de "Pode relaxar".
  const volta = 1 - rampa(t, cena.encerramento + 0.8, cena.encerramento + 3.5);
  return {
    curva: 1 - rampa(t, cena.posicaoInicial - 0.6, cena.posicaoInicial + 1.6),
    crescer:
      (0.7 * rampa(t, cena.cresca + 1.2, cena.cresca + 3.8) +
        0.3 * rampa(t, cena.terminar + 0.6, cena.terminar + 2.8)) *
      volta,
    cotovelos: rampa(t, cena.cotovelos + 3, cena.cotovelos + 5.2) * volta,
    deslocar: rampa(t, cena.fuga + 0.3, cena.fuga + 3) * volta,
    girar: rampa(t, cena.girar + 0.4, cena.girar + 3) * volta,
    ombros: rampa(t, cena.terminar + 3, cena.terminar + 5) * volta,
    // Respiração calma durante a sustentação: uma a cada 6 s.
    respirar:
      t > SUST_INICIO && t < SUST_FIM
        ? (1 - Math.cos((2 * Math.PI * (t - SUST_INICIO)) / 6)) / 2
        : 0,
  };
};

const calcularDestaques = (t: number): Destaques3D => ({
  pes: janela(t, cena.posicaoInicial, cena.maos),
  maos: janela(t, cena.maos, cena.cresca),
  coluna: janela(t, cena.cresca, cena.cotovelos),
  cotovelos: janela(t, cena.cotovelos + 2.5, cena.lombar),
  lombar: janela(t, cena.lombar + 1.5, cena.respirar),
  costelasEsquerda: janela(t, cena.respirar + 1, cena.encerramento) * 0.9,
  escapulas: janela(t, cena.terminar + 3, cena.fique),
});

const calcularSetas = (t: number): Setas3D => {
  const progresso = (a: number, dur: number) =>
    interpolate(t, [a, a + dur], [0, 1], { ...clamp, easing: suave });
  return {
    maos:
      janela(t, cena.maos + 1.2, cena.cresca) * progresso(cena.maos + 1.2, 0.8),
    cima: Math.max(
      janela(t, cena.cresca + 0.6, cena.cotovelos) *
        progresso(cena.cresca + 0.6, 1.1),
      janela(t, cena.terminar + 0.4, cena.fique) *
        progresso(cena.terminar + 0.4, 1.1),
    ),
    esquerda: janela(t, cena.fuga, cena.girar) * progresso(cena.fuga, 1.4),
    giro:
      janela(t, cena.girar, cena.terminar) * progresso(cena.girar + 0.2, 1.6),
    chao:
      Math.max(
        janela(t, cena.posicaoInicial + 0.3, cena.maos),
        janela(t, cena.maos, cena.encerramento) * 0.35,
      ) *
      (1 - ladoSustentacao(t)),
  };
};

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

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      <Esqueleto3D
        pose={calcularPose(t)}
        destaques={calcularDestaques(t)}
        setas={calcularSetas(t)}
        lado={ladoSustentacao(t)}
      />

      <Lados />
      <Abertura />
      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <Chamada
        texto="Pés firmes no chão"
        alvo={{ x: 880, y: 840 }}
        ancora={{ x: 690, y: 860 }}
        inicio={cena.posicaoInicial + 0.5}
        fim={cena.maos}
      />
      <Chamada
        texto="Mãos apoiadas nas coxas"
        alvo={{ x: 800, y: 600 }}
        ancora={{ x: 700, y: 650 }}
        inicio={cena.maos + 0.6}
        fim={cena.cresca}
      />
      <Chamada
        texto="Coluna alongada"
        alvo={{ x: 965, y: 370 }}
        ancora={{ x: 790, y: 270 }}
        inicio={cena.cresca + 1}
        fim={cena.cotovelos}
      />
      <Chamada
        texto="Cotovelos um pouco à frente"
        alvo={{ x: 850, y: 470 }}
        ancora={{ x: 720, y: 630 }}
        inicio={cena.cotovelos + 3}
        fim={cena.lombar}
      />
      <Chamada
        texto="Curvinha natural da lombar"
        alvo={{ x: 975, y: 505 }}
        ancora={{ x: 760, y: 700 }}
        inicio={cena.lombar + 2}
        fim={cena.respirar}
      />
      <Chamada
        texto="Encha este lado"
        alvo={{ x: 915, y: 410 }}
        ancora={{ x: 760, y: 270 }}
        inicio={cena.respirar + 1.4}
        fim={cena.fuga + 0.2}
      />
      <Chamada
        texto="Ombros baixos"
        alvo={{ x: 895, y: 305 }}
        ancora={{ x: 760, y: 250 }}
        inicio={cena.terminar + 3}
        fim={cena.fique}
      />
      <Cronometro />
      <Encerramento />
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
        top: 800,
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
