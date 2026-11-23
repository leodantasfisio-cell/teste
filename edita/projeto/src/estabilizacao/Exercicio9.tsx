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
import { criarRoteiro9, type Roteiro9 } from "./roteiro9";

// Vídeo 9 da pasta "Autocorreção Estabilização Funcional": vista de PERFIL,
// igual aos vídeos 1-6. Mão na coxa -> braço à frente (altura do ombro,
// crescimento axial) -> mantendo o braço estendido, inclina o tronco para
// trás, bem devagar, contraindo o abdômen (oposto ao vídeo 6, que inclinava
// para frente) -> segura alguns segundos -> volta a endireitar o tronco ->
// abaixa o braço e volta à posição inicial.

const PONTO_MAO_COXA = { x: 950, y: 590 };
const PONTO_BRACO_FRENTE = { x: 600, y: 260 };
const PONTO_TRONCO_INCLINADO = { x: 600, y: 230 };

const criarPassos = (r: Roteiro9): Passo[] => {
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
      fim: e.inclinaInicio,
      kicker: "PASSO 2 DE 3",
      titulo: "Braço à frente",
      sub: "Até a altura do ombro, crescimento axial",
    },
    {
      inicio: e.inclinaInicio,
      fim: e.voltaInicio,
      kicker: "PASSO 3 DE 3",
      titulo: "Incline o tronco para trás",
      sub: "Bem devagar, contraindo o abdômen",
    },
  ];
};

const Legendas: React.FC<{ r: Roteiro9 }> = ({ r }) => {
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

const Conteudo: React.FC<{ r: Roteiro9 }> = ({ r }) => {
  const { A2, etapas: e, pastaImagens: pasta } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paraBracos = rampa(t, e.bracosInicio, e.bracosInicio + 0.5);
  const paraInclina = rampa(t, e.inclinaInicio, e.inclinaInicio + 1.0);
  const paraVolta = rampa(t, e.voltaInicio, e.voltaInicio + 1.0);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 0.6);

  const opPosicaoInicial = Math.max(1 - paraBracos, paraRetorno);
  const opBracosFrente = Math.max(
    Math.min(paraBracos, 1 - paraInclina),
    Math.min(paraVolta, 1 - paraRetorno),
  );
  const opTroncoInclinado = Math.min(paraInclina, 1 - paraVolta);

  const dMaoCoxa = janela(t, A2 + 0.2, e.bracosInicio);
  const dBraco = Math.max(
    janela(t, e.bracosInicio + 0.2, e.inclinaInicio),
    janela(t, e.voltaInicio + 0.2, e.retornoInicio),
  );

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
            pastaDestaques="destaques-inicial"
            destaques={{ maos: dMaoCoxa }}
          />
        </AbsoluteFill>
      ) : null}
      {opBracosFrente > 0 ? (
        <AbsoluteFill style={{ opacity: opBracosFrente }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="bracos-frente.jpg"
            pastaDestaques="destaques-bracos"
            destaques={{ maos: dBraco }}
          />
        </AbsoluteFill>
      ) : null}
      {opTroncoInclinado > 0 ? (
        <AbsoluteFill style={{ opacity: opTroncoInclinado }}>
          <EsqueletoFoto pasta={pasta} imagem="tronco-inclinado-atras.jpg" />
        </AbsoluteFill>
      ) : null}

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
        texto="Braço na altura do ombro"
        alvo={naFoto(PONTO_BRACO_FRENTE.x, PONTO_BRACO_FRENTE.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.bracosInicio + 0.3}
        fim={e.inclinaInicio}
      />
      <Chamada
        texto="Incline para trás, contraindo o abdômen"
        alvo={naFoto(PONTO_TRONCO_INCLINADO.x, PONTO_TRONCO_INCLINADO.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.inclinaInicio + 0.3}
        fim={e.voltaInicio}
      />

      <Logo left={120} top={110} largura={440} inicio={r.A1} fim={A2 - 0.1} />
      <Logo right={40} top={34} largura={230} inicio={A2} fim={r.DURACAO} />
      <Legendas r={r} />

      <Audio src={staticFile(r.narracao.abertura)} from={Math.round(r.A1 * fps)} premountFor={fps} />
      <Audio src={staticFile(r.narracao.exercicio)} from={Math.round(A2 * fps)} premountFor={fps} />
      <Audio
        src={staticFile(r.narracao.encerramento)}
        from={Math.round(r.A3 * fps)}
        premountFor={fps}
      />
      <Audio src={staticFile("musica/fundo-calmo.wav")} volume={0.22} />
    </AbsoluteFill>
  );
};

export const Exercicio9: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro9(), []);
  return <Conteudo r={roteiro} />;
};
