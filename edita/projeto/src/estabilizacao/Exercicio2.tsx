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
import { Chamada } from "../correcao/Chamada";
import { cores } from "../correcao/cores";
import { EsqueletoFoto, naFoto } from "../correcao/EsqueletoFoto";
import { fonteTexto } from "../correcao/fontes";
import { Logo } from "../correcao/Logo";
import { criarRoteiro2, type Roteiro2 } from "./roteiro2";

// Vídeo 2 da pasta "Autocorreção Estabilização Funcional": vista de PERFIL, igual ao
// vídeo 1. Mão na coxa -> pega a bola e eleva o braço à frente (cotovelo esticado) ->
// movimentos circulares com a bola -> devolve a bola e volta à posição inicial.

const PASTA_DESTAQUES: Record<string, string> = {
  "bracos-frente-bola.jpg": "destaques-bracos",
  "bola-cima.jpg": "destaques-cima",
  "bola-baixo.jpg": "destaques-baixo",
};

const PONTO_MAO_COXA = { x: 950, y: 590 };
const PONTO_BOLA = { x: 610, y: 270 };

const criarPassos = (r: Roteiro2): Passo[] => {
  const { etapas: e } = r;
  return [
    {
      inicio: r.A2,
      fim: e.bracosInicio,
      kicker: "PASSO 1 DE 3",
      titulo: "Mão na coxa",
      sub: "Cresça a coluna e mantenha a autocorreção",
    },
    {
      inicio: e.bracosInicio,
      fim: e.circularInicio,
      kicker: "PASSO 2 DE 3",
      titulo: "Braço à frente com a bola",
      sub: "Cotovelo esticado, altura do ombro",
    },
    {
      inicio: e.circularInicio,
      fim: e.retornoInicio,
      kicker: "PASSO 3 DE 3",
      titulo: "Movimentos circulares",
      sub: "Bem devagar, mantendo a coluna crescida",
    },
  ];
};

const Legendas: React.FC<{ r: Roteiro2 }> = ({ r }) => {
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

const Conteudo: React.FC<{ r: Roteiro2 }> = ({ r }) => {
  const { A2, A3, etapas: e, pastaImagens: pasta } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paraBracos = rampa(t, e.bracosInicio, e.bracosInicio + 0.5);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 0.5);

  const opPosicaoInicial = Math.max(1 - paraBracos, paraRetorno);

  const crescimento =
    rampa(t, A2 + 5, A2 + 7.5) * (1 - rampa(t, A3, A3 + 1.5));

  const dMaoCoxa = janela(t, A2 + 0.2, e.bracosInicio);
  const dColuna = Math.max(
    janela(t, A2 + 5, A2 + 8),
    janela(t, e.retornoInicio - 1.1, e.fimA2) * 0.7,
  );
  const dBraco = janela(t, e.bracosInicio + 0.2, e.fimA2);

  const passos = criarPassos(r);

  // Entre bracosInicio e circularInicio, mostra o braço parado segurando a bola.
  const opBracosParado = Math.min(
    paraBracos,
    1 - rampa(t, e.circularInicio, e.circularInicio + 0.1),
  );

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
      {opBracosParado > 0 ? (
        <AbsoluteFill style={{ opacity: opBracosParado }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="bracos-frente-bola.jpg"
            pastaDestaques="destaques-bracos"
            destaques={{ coluna: dColuna, maos: dBraco }}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {r.circularSegmentos.map((seg) => {
        const opacidade = janela(t, seg.inicio, seg.fim);
        if (opacidade === 0) return null;
        return (
          <AbsoluteFill key={`c-${seg.inicio}`} style={{ opacity: opacidade }}>
            <EsqueletoFoto
              pasta={pasta}
              imagem={seg.imagem}
              pastaDestaques={PASTA_DESTAQUES[seg.imagem]}
              destaques={{ coluna: dColuna, maos: dBraco }}
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
      <Chamada
        texto="Braço esticado, segurando a bola"
        alvo={naFoto(PONTO_BOLA.x, PONTO_BOLA.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.bracosInicio + 0.3}
        fim={e.circularInicio}
      />
      <Chamada
        texto="Movimentos circulares, bem devagar"
        alvo={naFoto(PONTO_BOLA.x, PONTO_BOLA.y)}
        ancora={{ x: 1400, y: 350 }}
        inicio={e.circularInicio + 0.3}
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

export const Exercicio2: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro2(), []);
  return <Conteudo r={roteiro} />;
};
