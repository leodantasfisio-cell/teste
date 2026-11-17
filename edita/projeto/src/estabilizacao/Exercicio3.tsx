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
import { criarRoteiro3, type Roteiro3 } from "./roteiro3";

// Vídeo 3 da pasta "Autocorreção Estabilização Funcional": vista de PERFIL, igual
// aos vídeos 1 e 2. Mão na coxa -> pega o bastão -> eleva o bastão acima da cabeça
// (crescimento axial) -> levanta da cadeira, em pé com o bastão elevado -> segura
// 30 s -> senta de novo -> abaixa o bastão e volta à posição inicial.

const PONTO_MAO_COXA = { x: 950, y: 590 };
const PONTO_BASTAO_FRENTE = { x: 600, y: 260 };
const PONTO_BASTAO_CIMA_SENTADA = { x: 770, y: 100 };
const PONTO_BASTAO_CIMA_PE = { x: 770, y: 40 };

const criarPassos = (r: Roteiro3): Passo[] => {
  const { etapas: e } = r;
  return [
    {
      inicio: r.A2,
      fim: e.bracosInicio,
      kicker: "PASSO 1 DE 5",
      titulo: "Mão na coxa",
      sub: "Cresça a coluna e mantenha a autocorreção",
    },
    {
      inicio: e.bracosInicio,
      fim: e.elevadoInicio,
      kicker: "PASSO 2 DE 5",
      titulo: "Pegue o bastão",
      sub: "Na horizontal, mãos na largura dos ombros",
    },
    {
      inicio: e.elevadoInicio,
      fim: e.emPeInicio,
      kicker: "PASSO 3 DE 5",
      titulo: "Eleve o bastão",
      sub: "O máximo possível, crescendo a coluna",
    },
    {
      inicio: e.emPeInicio,
      fim: e.sustInicio,
      kicker: "PASSO 4 DE 5",
      titulo: "Levante-se, em bloco",
      sub: "Incline o tronco à frente sem curvar as costas",
    },
    {
      inicio: e.sustInicio,
      fim: e.sustFim,
      kicker: "PASSO 5 DE 5",
      titulo: "Segure em pé",
      sub: "Trinta segundos, continue respirando",
    },
  ];
};

const Legendas: React.FC<{ r: Roteiro3 }> = ({ r }) => {
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

// Cronômetro regressivo simples para a sustentação de 30 s.
const Cronometro: React.FC<{ r: Roteiro3 }> = ({ r }) => {
  const { etapas: e } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, e.sustInicio, e.sustFim + 0.3);
  if (opacidade === 0) return null;
  const restante = Math.max(0, Math.ceil(e.sustFim - t));
  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        top: 250,
        color: cores.texto,
        opacity: opacidade,
      }}
    >
      <div
        style={{
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: 6,
          color: cores.destaque,
        }}
      >
        SEGURE A POSIÇÃO
      </div>
      <div style={{ fontSize: 90, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {restante}s
      </div>
    </div>
  );
};

const Conteudo: React.FC<{ r: Roteiro3 }> = ({ r }) => {
  const { A2, A3, A4, etapas: e, pastaImagens: pasta } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const paraBracos = rampa(t, e.bracosInicio, e.bracosInicio + 0.5);
  const paraElevado = rampa(t, e.elevadoInicio, e.elevadoInicio + 0.6);
  const paraEmPe = rampa(t, e.emPeInicio, e.emPeInicio + 1.2);
  const paraSenta = rampa(t, e.sentaInicio, e.sentaInicio + 1.2);
  const paraRetorno = rampa(t, e.retornoInicio, e.retornoInicio + 0.6);

  const opPosicaoInicial = Math.max(1 - paraBracos, paraRetorno);
  const opBracosFrente = Math.min(paraBracos, 1 - paraElevado);
  // Elevado (sentada) fica visível entre elevadoInicio e emPeInicio, e reaparece
  // ao sentar de novo antes de abaixar o bastão.
  const opElevadoSentada = Math.max(
    Math.min(paraElevado, 1 - paraEmPe),
    Math.min(paraSenta, 1 - paraRetorno),
  );
  const opEmPe = Math.min(paraEmPe, 1 - paraSenta);

  const crescimento = rampa(t, e.elevadoInicio, e.elevadoInicio + 1.5);

  const dMaoCoxa = janela(t, A2 + 0.2, e.bracosInicio);
  const dBraco = janela(t, e.bracosInicio + 0.2, e.elevadoInicio);
  const dElevado = Math.max(
    janela(t, e.elevadoInicio + 0.2, e.emPeInicio),
    janela(t, e.sentaInicio + 0.2, e.retornoInicio),
  );
  const dPe = janela(t, e.emPeInicio + 0.3, e.sentaInicio);

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
            imagem="bracos-frente-bastao.jpg"
            pastaDestaques="destaques-bracos"
            destaques={{ maos: dBraco }}
          />
        </AbsoluteFill>
      ) : null}
      {opElevadoSentada > 0 ? (
        <AbsoluteFill style={{ opacity: opElevadoSentada }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="bastao-elevado.jpg"
            pastaDestaques="destaques-elevado"
            destaques={{ coluna: dElevado, maos: dElevado }}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {opEmPe > 0 ? (
        <AbsoluteFill style={{ opacity: opEmPe }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="em-pe-bastao.jpg"
            pastaDestaques="destaques-pe"
            destaques={{ coluna: dPe, maos: dPe }}
          />
        </AbsoluteFill>
      ) : null}

      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <Cronometro r={r} />

      <Chamada
        texto="Mão apoiada na coxa"
        alvo={naFoto(PONTO_MAO_COXA.x, PONTO_MAO_COXA.y)}
        ancora={{ x: 1350, y: 780 }}
        inicio={A2 + 0.6}
        fim={e.bracosInicio}
      />
      <Chamada
        texto="Bastão na horizontal, mãos na largura dos ombros"
        alvo={naFoto(PONTO_BASTAO_FRENTE.x, PONTO_BASTAO_FRENTE.y)}
        ancora={{ x: 1400, y: 300 }}
        inicio={e.bracosInicio + 0.3}
        fim={e.elevadoInicio}
      />
      <Chamada
        texto="Eleve o bastão o máximo possível"
        alvo={naFoto(PONTO_BASTAO_CIMA_SENTADA.x, PONTO_BASTAO_CIMA_SENTADA.y)}
        ancora={{ x: 1400, y: 120 }}
        inicio={e.elevadoInicio + 0.3}
        fim={e.emPeInicio}
      />
      <Chamada
        texto="Incline o tronco em bloco e levante-se"
        alvo={naFoto(PONTO_BASTAO_CIMA_PE.x, PONTO_BASTAO_CIMA_PE.y)}
        ancora={{ x: 1400, y: 90 }}
        inicio={e.emPeInicio + 0.3}
        fim={e.sustInicio}
      />

      <Logo left={120} top={110} largura={440} inicio={r.A1} fim={A2 - 0.1} />
      <Logo right={40} top={34} largura={230} inicio={A2} fim={r.DURACAO} />
      <Legendas r={r} />

      <Audio src={staticFile(r.narracao.abertura)} from={Math.round(r.A1 * fps)} premountFor={fps} />
      <Audio src={staticFile(r.narracao.exercicio)} from={Math.round(A2 * fps)} premountFor={fps} />
      <Audio
        src={staticFile("narracao/aviso-faltam-10.mp3")}
        from={Math.round(e.AVISO_10 * fps)}
        premountFor={fps}
      />
      <Audio src={staticFile(r.narracao.retomada)} from={Math.round(A3 * fps)} premountFor={fps} />
      <Audio src={staticFile(r.narracao.encerramento)} from={Math.round(A4 * fps)} premountFor={fps} />
      <Audio
        src={staticFile("sfx/ding.wav")}
        from={Math.round(e.sustFim * fps)}
        volume={0.3}
        premountFor={fps}
      />
      <Audio src={staticFile("musica/fundo-calmo.wav")} volume={0.22} />
    </AbsoluteFill>
  );
};

export const Exercicio3: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro3(), []);
  return <Conteudo r={roteiro} />;
};
