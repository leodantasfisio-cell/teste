import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
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

// Vídeo 1 da pasta "Autocorreção Estabilização Funcional": vista de PERFIL, como o
// vídeo-modelo. Mãos na coxa -> braço reto à frente (altura do ombro) -> joelho sobe
// e desce (pé sai do chão) com o braço parado -> o braço também passa a subir na
// diagonal junto com o joelho ("dissociação de cinturas") -> volta à posição inicial.
// De perfil só um lado do corpo aparece, então não há imagens espelhadas.

// Pontos de referência na imagem (2000 × 1116).
const PONTO_MAO_COXA = { x: 950, y: 590 };
const PONTO_MAO_FRENTE = { x: 620, y: 240 };
const PONTO_MAO_CIMA = { x: 650, y: 110 };
const PONTO_PE_ELEVADO = { x: 620, y: 810 };

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

const criarPassos = (r: Roteiro1): Passo[] => {
  const { etapas: e } = r;
  return [
    {
      inicio: r.A2,
      fim: e.bracosInicio,
      kicker: "PASSO 1 DE 4",
      titulo: "Mão na coxa",
      sub: "Cresça a coluna e mantenha a autocorreção",
    },
    {
      inicio: e.bracosInicio,
      fim: e.joelhoInicio,
      kicker: "PASSO 2 DE 4",
      titulo: "Braço à frente",
      sub: "Na altura do ombro, e fica parado",
    },
    {
      inicio: e.joelhoInicio,
      fim: e.bracoCimaInicio,
      kicker: "PASSO 3 DE 4",
      titulo: "Joelho sobe",
      sub: "Tire o pé do chão, bem devagar",
    },
    {
      inicio: e.bracoCimaInicio,
      fim: e.retornoInicio,
      kicker: "PASSO 4 DE 4",
      titulo: "Braço e joelho juntos",
      sub: "O braço sobe na diagonal junto com o joelho",
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
  const paraJoelho = rampa(t, e.joelhoInicio, e.joelhoInicio + 0.5);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 0.5);

  const opPosicaoInicial = Math.max(1 - paraBracos, paraRetorno);
  const opBracosFrente = Math.min(paraBracos, 1 - paraJoelho);

  const crescimento =
    rampa(t, A2 + 5, A2 + 7.5) * (1 - rampa(t, A3, A3 + 1.5));

  const passos = criarPassos(r);

  // Destaques acompanham a frase da narração que fala daquela parte do corpo.
  const dMaoCoxa = janela(t, A2 + 0.2, e.bracosInicio);
  const dColuna = Math.max(
    janela(t, A2 + 5, A2 + 8),
    janela(t, e.retornoInicio - 1.1, e.fimA2) * 0.7,
  );
  const dBraco = janela(t, e.bracosInicio + 0.2, e.joelhoInicio);
  const dPe = janela(t, e.joelhoInicio + 0.2, e.retornoInicio);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      {opPosicaoInicial > 0 ? (
        <AbsoluteFill style={{ opacity: opPosicaoInicial }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="posicao-inicial.jpg"
            pastaDestaques="destaques-inicial"
            destaques={{ maos: dMaoCoxa, coluna: dColuna }}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {opBracosFrente > 0 ? (
        <AbsoluteFill style={{ opacity: opBracosFrente }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="bracos-frente.jpg"
            pastaDestaques="destaques-bracos"
            destaques={{ coluna: dColuna, maos: dBraco }}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {r.joelhoSegmentos.map((seg) => {
        const opacidade = janela(t, seg.inicio, seg.fim);
        if (opacidade === 0) return null;
        const elevado = seg.imagem === "joelho-elevado.jpg";
        return (
          <AbsoluteFill
            key={`j-${seg.inicio}`}
            style={{ opacity: opacidade }}
          >
            <EsqueletoFoto
              pasta={pasta}
              imagem={seg.imagem}
              pastaDestaques={elevado ? "destaques-joelho" : "destaques-bracos"}
              destaques={{ coluna: dColuna, maos: dBraco, pes: elevado ? dPe : 0 }}
              crescimento={crescimento}
            />
          </AbsoluteFill>
        );
      })}
      {r.bracoCimaSegmentos.map((seg) => {
        const opacidade = janela(t, seg.inicio, seg.fim);
        if (opacidade === 0) return null;
        const cima = seg.imagem === "braco-cima-joelho.jpg";
        return (
          <AbsoluteFill
            key={`b-${seg.inicio}`}
            style={{ opacity: opacidade }}
          >
            <EsqueletoFoto
              pasta={pasta}
              imagem={seg.imagem}
              pastaDestaques={cima ? "destaques-braco-cima" : "destaques-bracos"}
              destaques={{
                coluna: dColuna,
                maos: dBraco,
                pes: cima ? dPe : 0,
              }}
              crescimento={crescimento}
            />
          </AbsoluteFill>
        );
      })}

      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}

      <Chamada
        texto="Mão apoiada na coxa"
        alvo={naFoto(PONTO_MAO_COXA.x, PONTO_MAO_COXA.y)}
        ancora={{ x: 1350, y: 780 }}
        inicio={A2 + 0.6}
        fim={e.bracosInicio}
      />
      <SetaSobe
        x={naFoto(PONTO_MAO_COXA.x, PONTO_MAO_COXA.y).x}
        y={naFoto(PONTO_MAO_COXA.x, PONTO_MAO_COXA.y).y}
        inicio={e.bracosInicio}
        fim={e.bracosInicio + 1.4}
      />
      <Chamada
        texto="Braço à frente, altura do ombro"
        alvo={naFoto(PONTO_MAO_FRENTE.x, PONTO_MAO_FRENTE.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.bracosInicio + 0.3}
        fim={e.joelhoInicio}
      />
      {r.joelhoSegmentos.map((seg, i) =>
        seg.imagem === "joelho-elevado.jpg" ? (
          <SetaSobe
            key={`seta-j-${i}`}
            x={naFoto(PONTO_PE_ELEVADO.x, PONTO_PE_ELEVADO.y).x}
            y={naFoto(PONTO_PE_ELEVADO.x, PONTO_PE_ELEVADO.y).y}
            inicio={seg.inicio + 0.2}
            fim={seg.inicio + 1.2}
          />
        ) : null,
      )}
      {r.bracoCimaSegmentos.map((seg, i) =>
        seg.imagem === "braco-cima-joelho.jpg" ? (
          <React.Fragment key={`seta-b-${i}`}>
            <SetaSobe
              x={naFoto(PONTO_PE_ELEVADO.x, PONTO_PE_ELEVADO.y).x}
              y={naFoto(PONTO_PE_ELEVADO.x, PONTO_PE_ELEVADO.y).y}
              inicio={seg.inicio + 0.2}
              fim={seg.inicio + 1.2}
            />
            <SetaSobe
              x={naFoto(PONTO_MAO_CIMA.x, PONTO_MAO_CIMA.y).x}
              y={naFoto(PONTO_MAO_CIMA.x, PONTO_MAO_CIMA.y).y}
              inicio={seg.inicio + 0.2}
              fim={seg.inicio + 1.2}
            />
          </React.Fragment>
        ) : null,
      )}
      <Chamada
        texto="Braço sobe junto com o joelho"
        alvo={naFoto(PONTO_MAO_CIMA.x, PONTO_MAO_CIMA.y)}
        ancora={{ x: 1400, y: 150 }}
        inicio={e.bracoCimaInicio + 0.3}
        fim={e.retornoInicio}
      />

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
