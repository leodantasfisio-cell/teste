import { Audio, Video } from "@remotion/media";
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

// Amputação 01 — transferência de peso laterolateral.
// Clipes do Gemini (Veo) espelhados para a prótese ficar na perna direita (à esquerda da tela),
// desacelerados e com parada de 2 s (ver briefings/amputacao-01-transferencia-peso-laterolateral.md).
// O vídeo roda 25% mais rápido (pedido do usuário): cada ciclo fica ~2,4 s indo,
// 1,6 s parado e ~2,2 s voltando. Abre com uma capa de 3 s.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.inOut(Easing.sin);

/** Velocidade dos clipes em relação à montagem anterior (1 = 3 s indo, 2 s parado). */
const VELOCIDADE = 1.25;
export const CICLO_PROTESE = 7.7 / VELOCIDADE;
export const CICLO_PERNA = 7.86 / VELOCIDADE;
/** Capa de entrada e quadro parado com a posição inicial (tempo da instrução falada). */
const CAPA = 3;
const POSICAO_INICIAL = 5.6;
/** Quadro parado enquanto a câmera aproxima e a narração diz "Mais uma vez…". */
const PAUSA_ZOOM = 2.8;
const FUSAO = 0.4; // sobreposição entre clipes para esconder a diferença de luz

const T = (() => {
  const inicio = CAPA;
  const protese1 = CAPA + POSICAO_INICIAL;
  const perna1 = protese1 + CICLO_PROTESE - FUSAO;
  const zoomIn = perna1 + CICLO_PERNA;
  const protese2 = zoomIn + PAUSA_ZOOM;
  const perna2 = protese2 + CICLO_PROTESE - FUSAO;
  const zoomOut = perna2 + CICLO_PERNA;
  return { inicio, protese1, perna1, zoomIn, protese2, perna2, zoomOut };
})();

/**
 * Narração (ElevenLabs, Henrique): cada frase é recortada do MP3 pelos silêncios
 * (silencedetect n=-38dB d=0.28, conferido na transcrição local) e posta no seu momento.
 */
const FRASES: { de: number; ate: number; quando: (t: typeof T) => number }[] = [
  { de: 0, ate: 1.24, quando: () => 0.5 }, // Transferência de peso.
  { de: 2.47, ate: 7.67, quando: (t) => t.inicio }, // Fique em pé entre duas cadeiras…
  { de: 8.67, ate: 10.45, quando: (t) => t.protese1 }, // Leve o peso devagar para a prótese.
  { de: 11.47, ate: 12.02, quando: (t) => t.protese1 + 3 / VELOCIDADE }, // Segure.
  { de: 13.05, ate: 13.92, quando: (t) => t.protese1 + 5 / VELOCIDADE }, // Volte ao centro.
  { de: 14.96, ate: 16.51, quando: (t) => t.perna1 }, // Agora, para a perna esquerda.
  { de: 17.53, ate: 18.14, quando: (t) => t.perna1 + 3 / VELOCIDADE }, // Segure.
  { de: 19.22, ate: 20.14, quando: (t) => t.perna1 + 5 / VELOCIDADE }, // Volte ao centro.
  { de: 21.16, ate: 23.76, quando: (t) => t.zoomIn }, // Mais uma vez, com o tronco reto…
  { de: 25.1, ate: 26.0, quando: (t) => t.protese2 }, // Para a prótese.
  { de: 27.28, ate: 28.61, quando: (t) => t.perna2 }, // E para a perna esquerda.
  { de: 29.82, ate: 30.45, quando: (t) => t.zoomOut + 0.3 }, // Muito bem!
];

export const DURACAO_TRANSFERENCIA = Math.ceil(T.zoomOut + 3);

/** Aproximação da pelve e das pernas, com os pés na base do quadro. */
const ZOOM = 1.6;

/** 0 → 1 → 0 do deslocamento da pelve dentro de um ciclo (segundos do ciclo). */
const deslocamento = (t: number, duracao: number) =>
  interpolate(t, [0, 3 / VELOCIDADE, 5 / VELOCIDADE, duracao], [0, 1, 1, 0], {
    ...clamp,
    easing: suave,
  });

// Seta horizontal discreta na altura da cintura, crescendo para o lado do deslocamento.
const SetaPelve: React.FC<{ direcao: -1 | 1; duracao: number }> = ({
  direcao,
  duracao,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = deslocamento(frame / fps, duracao);
  if (u < 0.02) return null;
  const y = 575;
  const x0 = 905; // centro do corpo no quadro (o homem fica um pouco à esquerda do meio)
  const x1 = x0 + direcao * (60 + 150 * u);
  const ponta = 22;
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        opacity: Math.min(1, u * 3) * 0.9,
      }}
    >
      <line
        x1={x0}
        y1={y}
        x2={x1}
        y2={y}
        stroke="#F2B84B"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1 - direcao * ponta} ${y - ponta} L ${x1} ${y} L ${x1 - direcao * ponta} ${y + ponta}`}
        fill="none"
        stroke="#F2B84B"
        strokeWidth={8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Ciclo: React.FC<{
  arquivo: string;
  duracao: number;
  direcao: -1 | 1;
  entraSuave: boolean;
}> = ({ arquivo, duracao, direcao, entraSuave }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacidade = entraSuave
    ? interpolate(frame, [0, FUSAO * fps], [0, 1], clamp)
    : 1;
  return (
    <AbsoluteFill style={{ opacity: opacidade }}>
      <Video
        src={staticFile(`amputacao/${arquivo}`)}
        muted
        playbackRate={VELOCIDADE}
      />
      <SetaPelve direcao={direcao} duracao={duracao} />
    </AbsoluteFill>
  );
};

export const Transferencia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const f = (s: number) => Math.round(s * fps);

  // Câmera: leve aproximação na abertura, zoom na pelve no 2º ciclo e volta ao quadro inteiro.
  const zoom =
    t < T.zoomIn
      ? interpolate(t, [T.inicio, T.protese1], [1, 1.03], {
          ...clamp,
          easing: suave,
        }) *
        interpolate(t, [T.protese1, T.protese1 + 0.6], [1, 1 / 1.03], clamp)
      : t < T.zoomOut
        ? interpolate(t, [T.zoomIn, T.zoomIn + 1], [1, ZOOM], {
            ...clamp,
            easing: suave,
          })
        : interpolate(t, [T.zoomOut, T.zoomOut + 1.2], [ZOOM, 1], {
            ...clamp,
            easing: suave,
          });

  const ciclo = (
    inicio: number,
    arquivo: string,
    duracao: number,
    direcao: -1 | 1,
    entraSuave: boolean,
  ) => (
    <Sequence from={f(inicio)} durationInFrames={f(duracao)}>
      <Ciclo
        arquivo={arquivo}
        duracao={duracao}
        direcao={direcao}
        entraSuave={entraSuave}
      />
    </Sequence>
  );

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{ scale: String(zoom), transformOrigin: "47% 100%" }}
      >
        {/* Quadro parado: abertura, transição do zoom e final */}
        <Sequence durationInFrames={f(T.protese1) + 2}>
          <Img src={staticFile("amputacao/inicio.jpg")} />
        </Sequence>
        <Sequence from={f(T.zoomIn) - 1} durationInFrames={f(PAUSA_ZOOM) + 2}>
          <Img src={staticFile("amputacao/inicio.jpg")} />
        </Sequence>
        <Sequence from={f(T.zoomOut) - 1}>
          <Img src={staticFile("amputacao/fim.jpg")} />
        </Sequence>
        {/* Peso para a prótese (esquerda da tela) e para a perna esquerda (direita da tela) */}
        {ciclo(T.protese1, "ciclo-protese.mp4", CICLO_PROTESE, -1, false)}
        {ciclo(T.perna1, "ciclo-perna.mp4", CICLO_PERNA, 1, true)}
        {ciclo(T.protese2, "ciclo-protese.mp4", CICLO_PROTESE, -1, false)}
        {ciclo(T.perna2, "ciclo-perna.mp4", CICLO_PERNA, 1, true)}
      </AbsoluteFill>

      {/* Logos nos cantos inferiores, como no vídeo de exemplo (entram depois da capa) */}
      <AbsoluteFill
        style={{
          opacity: interpolate(t, [CAPA - 0.4, CAPA + 0.2], [0, 1], clamp),
        }}
      >
        <Img
          src={staticFile("marca/logo-corredor.png")}
          style={{ position: "absolute", left: 36, bottom: 28, height: 150 }}
        />
        <Img
          src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")}
          style={{ position: "absolute", right: 36, bottom: 36, width: 300 }}
        />
      </AbsoluteFill>
      <Sequence durationInFrames={f(CAPA)}>
        <Capa />
      </Sequence>
      {FRASES.map(({ de, ate, quando }) => (
        <Sequence
          key={de}
          from={f(quando(T))}
          durationInFrames={f(ate - de) + 6}
        >
          <Audio
            src={staticFile("amputacao/narracao.mp3")}
            trimBefore={f(de)}
            trimAfter={f(ate) + 3}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Capa de entrada: quadro inicial escurecido e desfocado, título e as duas logos.
const Capa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const entra = (a: number) =>
    interpolate(t, [a, a + 0.6], [0, 1], {
      ...clamp,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  const sai = interpolate(t, [CAPA - 0.5, CAPA], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: sai, fontFamily: fonteTexto }}>
      <Img
        src={staticFile("amputacao/inicio.jpg")}
        style={{
          width: "100%",
          height: "100%",
          filter: "blur(14px) brightness(0.45)",
          scale: "1.08",
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          color: "#FFFFFF",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: 8,
            color: "#F2B84B",
            opacity: entra(0.1),
          }}
        >
          EXERCÍCIO 01
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
          Transferência de peso
          <br />
          laterolateral
        </div>
        <div
          style={{
            fontSize: 38,
            fontWeight: 500,
            color: "#E6E6E6",
            marginTop: 26,
            opacity: entra(0.6),
          }}
        >
          Amputação transtibial · em casa, com apoio de duas cadeiras
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 60,
            marginTop: 60,
            padding: "22px 48px",
            borderRadius: 26,
            // Cartão branco: o corpo do corredor é preto e sumiria no fundo escuro.
            backgroundColor: "rgba(255, 255, 255, 0.94)",
            opacity: entra(0.9),
          }}
        >
          <Img
            src={staticFile("marca/logo-corredor.png")}
            style={{ height: 170 }}
          />
          <Img
            src={staticFile("marca/logo-labortorio-sem-fundo-manual.png")}
            style={{ width: 380 }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
