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
  rampa,
  type Passo,
} from "../correcao/CorrecaoPostural";
import { Chamada } from "../correcao/Chamada";
import { cores } from "../correcao/cores";
import { EsqueletoFoto, naFoto } from "../correcao/EsqueletoFoto";
import { fonteTexto } from "../correcao/fontes";
import { Logo } from "../correcao/Logo";
import { criarRoteiro7, type Roteiro7 } from "./roteiro7";

// Vídeo 7 da pasta "Autocorreção Estabilização Funcional": vista DE COSTAS
// (diferente dos vídeos 1-6, que são de perfil). Posição inicial já é mãos
// entrelaçadas atrás da cabeça, cotovelos abertos -> cresce a coluna,
// tracionando a cabeça para cima (alonga o pescoço) -> segura alguns segundos
// -> solta as mãos e volta para a posição inicial.

const PONTO_MAOS_CABECA = { x: 1010, y: 140 };
const PONTO_COLUNA = { x: 1010, y: 420 };

const criarPassos = (r: Roteiro7): Passo[] => {
  const { etapas: e } = r;
  return [
    {
      inicio: r.A2,
      fim: e.cresceInicio,
      kicker: "PASSO 1 DE 2",
      titulo: "Mãos atrás da cabeça",
      sub: "Dedos entrelaçados, cotovelos abertos",
    },
    {
      inicio: e.cresceInicio,
      fim: e.retornoInicio,
      kicker: "PASSO 2 DE 2",
      titulo: "Cresça a coluna",
      sub: "Traciona a cabeça para cima, alongando o pescoço",
    },
  ];
};

const Legendas: React.FC<{ r: Roteiro7 }> = ({ r }) => {
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

const Conteudo: React.FC<{ r: Roteiro7 }> = ({ r }) => {
  const { A2, etapas: e, pastaImagens: pasta } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paraCostas = rampa(t, A2, A2 + 1.0);
  const paraCresce = rampa(t, e.cresceInicio, e.cresceInicio + 1.0);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 1.0);

  const opLado = 1 - paraCostas;
  const opMaosCabeca = Math.max(Math.min(paraCostas, 1 - paraCresce), paraRetorno);
  const opCresce = Math.min(paraCresce, 1 - paraRetorno);

  const passos = criarPassos(r);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      {opLado > 0 ? (
        <AbsoluteFill style={{ opacity: opLado }}>
          <EsqueletoFoto pasta={pasta} imagem="posicao-inicial-lado.jpg" />
        </AbsoluteFill>
      ) : null}
      {opMaosCabeca > 0 ? (
        <AbsoluteFill style={{ opacity: opMaosCabeca }}>
          <EsqueletoFoto pasta={pasta} imagem="maos-cabeca.jpg" />
        </AbsoluteFill>
      ) : null}
      {opCresce > 0 ? (
        <AbsoluteFill style={{ opacity: opCresce }}>
          <EsqueletoFoto pasta={pasta} imagem="crescimento-axial.jpg" />
        </AbsoluteFill>
      ) : null}

      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}

      <Chamada
        texto="Dedos entrelaçados na nuca"
        alvo={naFoto(PONTO_MAOS_CABECA.x, PONTO_MAOS_CABECA.y)}
        ancora={{ x: 1450, y: 220 }}
        inicio={A2 + 0.6}
        fim={e.cresceInicio}
      />
      <Chamada
        texto="Cresça a coluna, alongando o pescoço"
        alvo={naFoto(PONTO_COLUNA.x, PONTO_COLUNA.y)}
        ancora={{ x: 1450, y: 450 }}
        inicio={e.cresceInicio + 0.3}
        fim={e.retornoInicio}
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

export const Exercicio7: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro7(), []);
  return <Conteudo r={roteiro} />;
};
