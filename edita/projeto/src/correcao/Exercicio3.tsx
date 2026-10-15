import { Audio } from "@remotion/media";
import { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Chamada } from "./Chamada";
import { cores } from "./cores";
import {
  clamp,
  Cronometro,
  Encerramento,
  EtiquetaPasso,
  janela,
  Lados,
  ladoSustentacao,
  Legendas,
  LinhasChao,
  rampa,
  SetaCima,
  SetasMaos,
  suave,
  type Passo,
} from "./CorrecaoPostural";
import { EsqueletoFoto, type DestaquesFoto } from "./EsqueletoFoto";
import { fonteTexto } from "./fontes";
import { Logo } from "./Logo";
import { RoteiroContexto } from "./roteiro";
import { ARQUIVO_NARRACAO, criarRoteiro3, NARRACAO_PRONTA } from "./roteiro3";

// Vídeo 3: crescimento axial, quadril, respiração nas últimas costelas da direita,
// ombros e cabeça alinhados e lombar. Imagens espelhadas (lado direito).

type Roteiro3 = ReturnType<typeof criarRoteiro3>;

/** Chamada com a etiqueta à direita do traço; recebe coordenadas de tela. */
const ChamadaDireita: React.FC<{
  texto: string;
  alvo: { x: number; y: number };
  ancora: { x: number; y: number };
  inicio: number;
  fim: number;
}> = ({ alvo, ancora, ...resto }) => (
  <Chamada
    {...resto}
    espelhar
    alvo={{ x: 1920 - alvo.x, y: alvo.y }}
    ancora={{ x: 1920 - ancora.x, y: ancora.y }}
  />
);

const calcularDestaques = (r: Roteiro3, t: number): DestaquesFoto => {
  const e = r.etapas;
  return {
    maos: janela(t, e.maos, e.puxe),
    coluna: janela(t, e.empurre + 1, e.quadril),
    quadril: janela(t, e.quadril + 0.6, e.respiracao),
    costelasBaixas: janela(t, e.encha + 0.4, r.SUST_FIM) * 0.9,
    cabecaOmbros: janela(t, e.ombros, e.lombar),
    lombar: janela(t, e.lombar + 0.8, e.fique),
  };
};

const calcularCrescimento = (r: Roteiro3, t: number) =>
  rampa(t, r.etapas.empurre + 1.5, r.etapas.puxe + 1.5) *
  (1 - rampa(t, r.SUST_FIM + 0.8, r.SUST_FIM + 3.5));

const criarPassos = (r: Roteiro3): Passo[] => {
  const e = r.etapas;
  return [
    {
      inicio: e.maos,
      fim: e.quadril,
      kicker: "PASSO 1 DE 5",
      titulo: "Mãos nas coxas",
      sub: "Empurre as pernas e cresça para cima",
    },
    {
      inicio: e.quadril,
      fim: e.respiracao,
      kicker: "PASSO 2 DE 5",
      titulo: "Ajuste o quadril",
      sub: "Aperte o lado direito e leve o quadril para a direita",
    },
    {
      inicio: e.respiracao,
      fim: e.ombros,
      kicker: "PASSO 3 DE 5",
      titulo: "Respiração e tórax",
      sub: "Expanda as últimas costelas da direita e afaste o tronco da esquerda",
    },
    {
      inicio: e.ombros,
      fim: e.lombar,
      kicker: "PASSO 4 DE 5",
      titulo: "Ombros e cabeça alinhados",
      sub: "Sem inclinar para os lados",
    },
    {
      inicio: e.lombar,
      fim: e.fique,
      kicker: "PASSO 5 DE 5",
      titulo: "Curvatura da lombar",
      sub: "Não deixe as costas retas",
    },
  ];
};

const Conteudo: React.FC<{ r: Roteiro3 }> = ({ r }) => {
  const { A2, A3, AVISO_10, AVISO_30, SUST_FIM, etapas: e } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // A coluna com escoliose fica até "Encha de ar", quando a postura é corrigida.
  const curva = 1 - rampa(t, e.encha, e.encha + 1.5);
  const destaques = calcularDestaques(r, t);
  const crescimento = calcularCrescimento(r, t);
  const passos = criarPassos(r);

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      <EsqueletoFoto
        pasta={r.pastaEsqueleto}
        imagem="costas-neutro.jpg"
        destaques={destaques}
        crescimento={crescimento}
      />
      {ladoSustentacao(r, t) > 0 ? (
        <AbsoluteFill style={{ opacity: ladoSustentacao(r, t) }}>
          <EsqueletoFoto pasta={r.pastaEsqueleto} imagem="lado-correto.jpg" />
        </AbsoluteFill>
      ) : null}
      {curva > 0 ? (
        <AbsoluteFill style={{ opacity: curva }}>
          <EsqueletoFoto
            pasta={r.pastaEsqueleto}
            imagem="costas-curva-a.jpg"
            pastaDestaques="destaques-curva"
            destaques={destaques}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}

      <Lados />
      <Abertura3 r={r} />
      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <SetasMaos />
      <SetaCima inicio={e.empurre + 1.2} fim={e.quadril} />
      <SetaDireita
        y={655}
        x0={1080}
        cor={cores.destaque}
        inicio={e.leveQuadril + 0.3}
        fim={e.respiracao}
      />
      <SetaDireita
        y={300}
        x0={990}
        cor={cores.azul}
        inicio={e.fuga + 0.3}
        fim={e.ombros}
      />
      <Cronometro />
      <Encerramento />
      <LinhasChao />
      <ChamadaDireita
        texto="Empurre as mãos nas coxas"
        alvo={{ x: 1155, y: 646 }}
        ancora={{ x: 1250, y: 540 }}
        inicio={e.empurre + 0.4}
        fim={e.puxe}
      />
      <ChamadaDireita
        texto="Aperte este lado do quadril"
        alvo={{ x: 1010, y: 640 }}
        ancora={{ x: 1250, y: 800 }}
        inicio={e.aperte + 0.3}
        fim={e.leveQuadril + 0.2}
      />
      <ChamadaDireita
        texto="Expanda as últimas costelas"
        alvo={{ x: 1012, y: 480 }}
        ancora={{ x: 1210, y: 440 }}
        inicio={e.encha + 0.6}
        fim={e.fuga + 0.2}
      />
      <ChamadaDireita
        texto="Ombros e cabeça alinhados"
        alvo={{ x: 1045, y: 330 }}
        ancora={{ x: 1210, y: 230 }}
        inicio={e.ombros + 0.5}
        fim={e.lombar}
      />
      <ChamadaDireita
        texto="Curvatura natural da lombar"
        alvo={{ x: 962, y: 570 }}
        ancora={{ x: 1210, y: 520 }}
        inicio={e.curvatura}
        fim={e.fique}
      />
      <Logo left={120} top={160} largura={440} inicio={r.A1} fim={A2 - 0.1} />
      <Logo
        right={40}
        top={34}
        largura={230}
        inicio={A2}
        fim={r.cena.encerramento}
      />
      <Legendas />

      {NARRACAO_PRONTA ? (
        <Audio
          src={staticFile(ARQUIVO_NARRACAO)}
          from={A2 * fps}
          premountFor={fps}
        />
      ) : null}
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

export const Exercicio3: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro3(), []);
  return (
    <RoteiroContexto.Provider value={roteiro}>
      <Conteudo r={roteiro} />
    </RoteiroContexto.Provider>
  );
};

const Abertura3: React.FC<{ r: Roteiro3 }> = ({ r }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fim = r.A2 - 0.1;
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
          opacity: entra(r.A1),
        }}
      >
        EXERCÍCIO 3
      </div>
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          lineHeight: 1.05,
          marginTop: 12,
          opacity: entra(r.A1 + 0.2),
          translate: `0 ${(1 - entra(r.A1 + 0.2)) * 30}px`,
        }}
      >
        Correção postural
        <br />
        <span style={{ color: cores.destaque }}>quadril e tórax</span>
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
          opacity: entra(r.A1 + 1.6),
          translate: `${(1 - entra(r.A1 + 1.6)) * -20}px 0`,
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

// Seta horizontal que cresce para a direita (lado direito do corpo, visto de costas).
const SetaDireita: React.FC<{
  y: number;
  x0: number;
  cor: string;
  inicio: number;
  fim: number;
}> = ({ y, x0, cor, inicio, fim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, inicio, fim);
  if (opacidade === 0) return null;
  const anda = interpolate(t, [inicio, inicio + 1.2], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const x1 = x0 + 230 * anda;
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
        stroke={cor}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M ${x1 - 30} ${y - 26} L ${x1} ${y} L ${x1 - 30} ${y + 26}`}
        fill="none"
        stroke={cor}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
