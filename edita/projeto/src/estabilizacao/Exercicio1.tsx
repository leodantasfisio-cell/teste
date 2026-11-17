import { Audio } from "@remotion/media";
import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  clamp,
  EtiquetaPasso,
  janela,
  rampa,
  suave,
  type Passo,
} from "../correcao/CorrecaoPostural";
import { Chamada } from "../correcao/Chamada";
import { cores } from "../correcao/cores";
import { EsqueletoFoto, naFoto } from "../correcao/EsqueletoFoto";
import { fonteTexto } from "../correcao/fontes";
import { Logo } from "../correcao/Logo";
import { criarRoteiro1, type Roteiro1 } from "./roteiro1";

// Pontos de referência na imagem (2000 × 1116, mesma grade da Correção Postural).
const PONTO_MAO_COXA_ESQ = { x: 770, y: 690 };
const PONTO_MAO_COXA_DIR = { x: 1230, y: 690 };
const PONTO_MAO_FRENTE_DIR = { x: 1224, y: 271 };
const PONTO_PE_ESQUERDO_ELEVADO = { x: 1224, y: 941 }; // aparece à direita da tela
const PONTO_PE_DIREITO_ELEVADO = { x: 800, y: 941 }; // aparece à esquerda da tela (espelho)

// Seta vertical que cresce de baixo para cima, indicando "eleve isto".
const SetaSobe: React.FC<{
  x: number;
  y: number;
  inicio: number;
  fim: number;
}> = ({ x, y, inicio, fim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, inicio, fim);
  if (opacidade === 0) return null;
  const sobe = interpolate(t, [inicio, inicio + 0.8], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const comprimento = 100 * sobe;
  return (
    <svg
      width={1920}
      height={1080}
      style={{ position: "absolute", inset: 0, opacity: opacidade }}
    >
      <line
        x1={x}
        y1={y}
        x2={x}
        y2={y - comprimento}
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M ${x - 24} ${y - comprimento + 28} L ${x} ${y - comprimento} L ${x + 24} ${y - comprimento + 28}`}
        fill="none"
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

// Vídeo 1 da pasta "Autocorreção Estabilização Funcional": sentado, mãos nas coxas,
// braços elevados à frente (ficam parados dali em diante) e elevação alternada dos pés.
// Diferente da Correção Postural, não há destaques de curva nem sustentação de 1 min:
// o próprio movimento alternado dos pés é o exercício, no ritmo da narração.

const criarPassos = (r: Roteiro1): Passo[] => {
  const { etapas: e } = r;
  return [
    {
      inicio: r.A2,
      fim: e.bracosInicio,
      kicker: "PASSO 1 DE 3",
      titulo: "Mãos nas coxas",
      sub: "Cresça a coluna e mantenha a autocorreção",
    },
    {
      inicio: e.bracosInicio,
      fim: e.pernasInicio,
      kicker: "PASSO 2 DE 3",
      titulo: "Braços à frente",
      sub: "Na altura dos ombros, e ficam parados",
    },
    {
      inicio: e.pernasInicio,
      fim: e.retornoInicio,
      kicker: "PASSO 3 DE 3",
      titulo: "Pés alternados",
      sub: "Eleve um pé de cada vez, bem devagar",
    },
  ];
};

const Legendas: React.FC<{ r: Roteiro1 }> = ({ r }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  const atual = r.legendas.find((c) => ms >= c.startMs && ms < c.endMs);
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

const Conteudo: React.FC<{ r: Roteiro1 }> = ({ r }) => {
  const { A2, A3, etapas: e, pastaImagens: pasta } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paraBracos = rampa(t, e.bracosInicio, e.bracosInicio + 0.5);
  const paraPernas = rampa(t, e.pernasInicio, e.pernasInicio + 0.5);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 0.5);

  const opPosicaoInicial = Math.max(1 - paraBracos, paraRetorno);
  const opBracosFrente = Math.min(paraBracos, 1 - paraPernas);

  const crescimento =
    rampa(t, A2 + 5.023, A2 + 7.5) * (1 - rampa(t, A3, A3 + 1.5));

  const passos = criarPassos(r);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      {opPosicaoInicial > 0 ? (
        <AbsoluteFill style={{ opacity: opPosicaoInicial }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="posicao-inicial.jpg"
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {opBracosFrente > 0 ? (
        <AbsoluteFill style={{ opacity: opBracosFrente }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="bracos-frente.jpg"
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {r.pernaSegmentos.map((seg) => {
        const opacidade = janela(t, seg.inicio, seg.fim);
        if (opacidade === 0) return null;
        return (
          <AbsoluteFill
            key={`${seg.imagem}-${seg.inicio}`}
            style={{ opacity: opacidade }}
          >
            <EsqueletoFoto
              pasta={pasta}
              imagem={seg.imagem}
              crescimento={crescimento}
            />
          </AbsoluteFill>
        );
      })}

      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}

      {/* Mãos nas coxas: seta e etiqueta logo no início do exercício. */}
      <Chamada
        texto="Mãos apoiadas nas coxas"
        alvo={naFoto(PONTO_MAO_COXA_DIR.x, PONTO_MAO_COXA_DIR.y)}
        ancora={{ x: 1350, y: 780 }}
        inicio={A2 + 0.6}
        fim={e.bracosInicio}
      />

      {/* Eleve os braços à frente: setas subindo nas duas mãos + etiqueta. */}
      <SetaSobe
        x={naFoto(PONTO_MAO_COXA_ESQ.x, PONTO_MAO_COXA_ESQ.y).x}
        y={naFoto(PONTO_MAO_COXA_ESQ.x, PONTO_MAO_COXA_ESQ.y).y}
        inicio={e.bracosInicio}
        fim={e.bracosInicio + 1.4}
      />
      <SetaSobe
        x={naFoto(PONTO_MAO_COXA_DIR.x, PONTO_MAO_COXA_DIR.y).x}
        y={naFoto(PONTO_MAO_COXA_DIR.x, PONTO_MAO_COXA_DIR.y).y}
        inicio={e.bracosInicio}
        fim={e.bracosInicio + 1.4}
      />
      <Chamada
        texto="Braços à frente, altura dos ombros"
        alvo={naFoto(PONTO_MAO_FRENTE_DIR.x, PONTO_MAO_FRENTE_DIR.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.bracosInicio + 0.3}
        fim={e.pernasInicio}
      />

      {/* Pés alternados: seta subindo no pé elevado de cada segmento + etiqueta. */}
      {r.pernaSegmentos.map((seg, i) => {
        const esquerdo = seg.imagem.includes("esquerdo");
        const ponto = esquerdo
          ? PONTO_PE_ESQUERDO_ELEVADO
          : PONTO_PE_DIREITO_ELEVADO;
        const p = naFoto(ponto.x, ponto.y);
        return (
          <SetaSobe
            key={`seta-${i}`}
            x={p.x}
            y={p.y}
            inicio={seg.inicio + 0.2}
            fim={seg.inicio + 1.3}
          />
        );
      })}
      <Logo left={120} top={110} largura={440} inicio={r.A1} fim={A2 - 0.1} />
      <Logo right={40} top={34} largura={230} inicio={A2} fim={r.DURACAO} />
      <Legendas r={r} />

      <Audio src={staticFile(r.narracao.abertura)} from={Math.round(r.A1 * fps)} premountFor={fps} />
      <Audio src={staticFile(r.narracao.exercicio)} from={Math.round(A2 * fps)} premountFor={fps} />
      <Audio src={staticFile(r.narracao.encerramento)} from={Math.round(A3 * fps)} premountFor={fps} />
      <Audio src={staticFile("musica/fundo-calmo.wav")} volume={0.22} />
    </AbsoluteFill>
  );
};

export const Exercicio1: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro1(), []);
  return <Conteudo r={roteiro} />;
};
