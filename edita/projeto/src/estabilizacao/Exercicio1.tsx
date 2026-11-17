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
  type Passo,
} from "../correcao/CorrecaoPostural";
import { cores } from "../correcao/cores";
import { EsqueletoFoto } from "../correcao/EsqueletoFoto";
import { fonteTexto } from "../correcao/fontes";
import { Logo } from "../correcao/Logo";
import { criarRoteiro1, type Roteiro1 } from "./roteiro1";

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
