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
import { Abertura3, ChamadaLado } from "./Exercicio3";
import { fonteTexto } from "./fontes";
import { Logo } from "./Logo";
import { LogoScolioFisio } from "./LogoScolioFisio";
import { RoteiroContexto } from "./roteiro";
import { criarRoteiro5 } from "./roteiro5";

// Vídeo 5: curva dupla. Quadril apertado e girado para a direita (lombar),
// cotovelos à frente, tórax esquerdo expandido e girado para a esquerda.
// Imagens do vídeo 4: curva em S (torácica convexa à direita, lombar à esquerda).

type Roteiro5 = ReturnType<typeof criarRoteiro5>;

const calcularDestaques = (r: Roteiro5, t: number): DestaquesFoto => {
  const e = r.etapas;
  return {
    maos: janela(t, e.maos, e.puxe),
    coluna: janela(t, e.empurre + 1, e.quadril),
    quadril: janela(t, e.quadril + 0.6, e.costas),
    lombar: janela(t, e.gireQuadril + 2.5, e.costas),
    cotovelos: janela(t, e.cotovelos, e.respiracao),
    // Alto das costas (cifose torácica), onde o terapeuta põe a mão no modelo.
    cifose: janela(t, e.cotovelos + 1.5, e.respiracao) * 0.85,
    torax: janela(t, e.encha + 0.4, r.SUST_FIM) * 0.9,
    cabecaOmbros: janela(t, e.ombros, e.fique),
  };
};

const calcularCrescimento = (r: Roteiro5, t: number) =>
  rampa(t, r.etapas.empurre + 1.5, r.etapas.puxe + 1.5) *
  (1 - rampa(t, r.SUST_FIM + 0.8, r.SUST_FIM + 3.5));

const criarPassos = (r: Roteiro5): Passo[] => {
  const e = r.etapas;
  return [
    {
      inicio: e.maos,
      fim: e.quadril,
      kicker: "PASSO 1 DE 5",
      titulo: "Mãos nas coxas",
      sub: "Cresça a coluna para cima",
    },
    {
      inicio: e.quadril,
      fim: e.costas,
      kicker: "PASSO 2 DE 5",
      titulo: "Quadril para a direita",
      sub: "Aperte o lado direito e gire o quadril para a direita",
    },
    {
      inicio: e.costas,
      fim: e.respiracao,
      kicker: "PASSO 3 DE 5",
      titulo: "Cotovelos à frente",
      sub: "Mantém a curva natural do alto das costas",
    },
    {
      inicio: e.respiracao,
      fim: e.ombros,
      kicker: "PASSO 4 DE 5",
      titulo: "Tórax para a esquerda",
      sub: "Expanda o lado esquerdo e gire o alto das costas para a esquerda",
    },
    {
      inicio: e.ombros,
      fim: e.fique,
      kicker: "PASSO 5 DE 5",
      titulo: "Ombros e cabeça alinhados",
      sub: "Sem inclinar para os lados",
    },
  ];
};

const so = (d: DestaquesFoto, chaves: (keyof DestaquesFoto)[]) =>
  Object.fromEntries(chaves.map((c) => [c, d[c]])) as DestaquesFoto;

const Conteudo: React.FC<{ r: Roteiro5 }> = ({ r }) => {
  const { A2, A3, AVISO_10, AVISO_30, SUST_FIM, etapas: e } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Curva em S até "Vamos ajustar o quadril", intermediária até "Encha de ar", reta depois.
  const intermediaria = rampa(t, e.quadril, e.quadril + 1.5);
  const reta = rampa(t, e.encha, e.encha + 1.5);
  const destaques = calcularDestaques(r, t);
  const crescimento = calcularCrescimento(r, t);
  const passos = criarPassos(r);
  const pasta = r.pastaImagens;

  return (
    <AbsoluteFill
      style={{ backgroundColor: cores.fundo, fontFamily: fonteTexto }}
    >
      <EsqueletoFoto
        pasta={pasta}
        imagem="costas-curva-s.jpg"
        pastaDestaques="destaques5-curva-s"
        destaques={so(destaques, ["maos", "coluna", "quadril"])}
        crescimento={crescimento}
      />
      {intermediaria > 0 && reta < 1 ? (
        <AbsoluteFill style={{ opacity: intermediaria }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="costas-intermediaria.jpg"
            pastaDestaques="destaques5-intermediaria"
            destaques={so(destaques, [
              "quadril",
              "lombar",
              "cotovelos",
              "cifose",
              "torax",
            ])}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {reta > 0 ? (
        <AbsoluteFill style={{ opacity: reta }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="costas-reta.jpg"
            pastaDestaques="destaques5-reta"
            destaques={so(destaques, ["torax", "cabecaOmbros"])}
            crescimento={crescimento}
          />
        </AbsoluteFill>
      ) : null}
      {ladoSustentacao(r, t) > 0 ? (
        <AbsoluteFill style={{ opacity: ladoSustentacao(r, t) }}>
          <EsqueletoFoto pasta={r.pastaEsqueleto} imagem="lado-correto.jpg" />
        </AbsoluteFill>
      ) : null}

      <Lados />
      <Abertura3 r={r} subtitulo="curva dupla" />
      {passos.map((p) => (
        <EtiquetaPasso key={p.kicker} passo={p} />
      ))}
      <SetasMaos />
      <SetaCima inicio={e.empurre + 1.2} fim={e.quadril} />
      <SetaGiro
        cy={600}
        rx={150}
        ry={36}
        paraDireita
        inicio={e.gireQuadril + 0.3}
        fim={e.costas}
      />
      <SetaGiro
        cy={330}
        rx={200}
        ry={50}
        paraDireita={false}
        inicio={e.gireTorax + 0.3}
        fim={e.ombros}
      />
      <Cronometro />
      <Encerramento />
      <LogoScolioFisio
        left={120}
        top={680}
        largura={420}
        inicio={r.A1 + 1.2}
        fim={A2 - 0.1}
      />
      <LogoScolioFisio
        left={120}
        top={750}
        largura={420}
        inicio={r.cena.inscreva + 1.4}
        fim={r.DURACAO + 1}
      />
      <LinhasChao />
      <ChamadaLado
        espelhado={false}
        texto="Empurre as mãos nas coxas"
        alvo={{ x: 1113, y: 590 }}
        ancora={{ x: 1250, y: 540 }}
        inicio={e.empurre + 0.4}
        fim={e.puxe}
      />
      <ChamadaLado
        espelhado={false}
        texto="Aperte este lado do quadril"
        alvo={{ x: 1020, y: 630 }}
        ancora={{ x: 1250, y: 800 }}
        inicio={e.aperte + 0.3}
        fim={e.gireQuadril + 0.2}
      />
      <ChamadaLado
        espelhado={false}
        texto="Curvatura natural da lombar"
        alvo={{ x: 960, y: 560 }}
        ancora={{ x: 1250, y: 470 }}
        inicio={e.gireQuadril + 3}
        fim={e.costas}
      />
      <ChamadaLado
        espelhado={false}
        texto="Cotovelos um pouco à frente"
        alvo={{ x: 1121, y: 500 }}
        ancora={{ x: 1260, y: 420 }}
        inicio={e.cotovelos + 0.5}
        fim={e.respiracao}
      />
      {/* Tórax esquerdo: etiqueta à esquerda, acima do texto do passo. */}
      <Chamada
        texto="Expanda este lado"
        alvo={{ x: 905, y: 440 }}
        ancora={{ x: 760, y: 250 }}
        inicio={e.encha + 0.6}
        fim={e.gireTorax + 0.2}
      />
      <ChamadaLado
        espelhado={false}
        texto="Ombros e cabeça alinhados"
        alvo={{ x: 1037, y: 355 }}
        ancora={{ x: 1210, y: 230 }}
        inicio={e.ombros + 0.5}
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

      <Audio src={staticFile(r.narracao)} from={A2 * fps} premountFor={fps} />
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

export const Exercicio5: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro5(), []);
  return (
    <RoteiroContexto.Provider value={roteiro}>
      <Conteudo r={roteiro} />
    </RoteiroContexto.Provider>
  );
};

// Seta curva de rotação, vista de costas: o arco de trás da elipse anda para o lado do giro.
const SetaGiro: React.FC<{
  cy: number;
  rx: number;
  ry: number;
  paraDireita: boolean;
  inicio: number;
  fim: number;
}> = ({ cy, rx, ry, paraDireita, inicio, fim }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacidade = janela(t, inicio, fim);
  if (opacidade === 0) return null;
  const anda = interpolate(t, [inicio + 0.2, inicio + 1.6], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const cx = 960;
  // Arco superior, de -20° (direita) até -20° - 140° * anda (para a esquerda).
  const pontos = Array.from({ length: 40 }, (_, i) => {
    const a = ((-20 - 140 * anda * (i / 39)) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });
  const [px, py] = pontos[pontos.length - 1];
  const [qx, qy] = pontos[pontos.length - 2];
  const ang = Math.atan2(py - qy, px - qx);
  const ponta = (d: number) =>
    `${px - 30 * Math.cos(ang + d)} ${py - 30 * Math.sin(ang + d)}`;
  return (
    <svg
      width={1920}
      height={1080}
      style={{
        position: "absolute",
        inset: 0,
        opacity: opacidade,
        // Desenhada girando para a esquerda; espelha no centro da tela para a direita.
        scale: paraDireita ? "-1 1" : undefined,
      }}
    >
      <polyline
        points={pontos.map(([x, y]) => `${x},${y}`).join(" ")}
        fill="none"
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
      />
      {anda > 0.05 ? (
        <path
          d={`M ${ponta(0.5)} L ${px} ${py} L ${ponta(-0.5)}`}
          fill="none"
          stroke={cores.destaque}
          strokeWidth={10}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  );
};
