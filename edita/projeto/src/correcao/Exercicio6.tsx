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
import { Abertura3, ChamadaLado, SetaLadoCorrecao } from "./Exercicio3";
import { SetaGiro } from "./Exercicio5";
import { fonteTexto } from "./fontes";
import { Logo } from "./Logo";
import { RoteiroContexto } from "./roteiro";
import { criarRoteiro6 } from "./roteiro6";

// Vídeo 6: curva dupla, espelho do vídeo 5. Quadril esquerdo para baixo e para trás,
// cotovelos à frente, tórax direito expandido e girado para a direita, e uma etapa de
// respiração (encher a direita, fechar a esquerda). Imagens do vídeo 3: curva em S com a
// torácica convexa à esquerda e a lombar à direita.

type Roteiro6 = ReturnType<typeof criarRoteiro6>;

const calcularDestaques = (r: Roteiro6, t: number): DestaquesFoto => {
  const e = r.etapas;
  return {
    maos: janela(t, e.maos, e.puxe),
    coluna: janela(t, e.empurre + 1, e.quadril),
    quadril: janela(t, e.aperte, e.costas),
    lombar: janela(t, e.lombar, e.costas),
    cotovelos: janela(t, e.cotovelos, e.torax),
    cifose: janela(t, e.cotovelos + 1.5, e.torax) * 0.85,
    torax: janela(t, e.expanda + 0.4, r.SUST_FIM) * 0.9,
    cabecaOmbros: Math.max(
      janela(t, e.ombros, e.respiracao),
      janela(t, e.alinhados, e.fique),
    ),
  };
};

const calcularCrescimento = (r: Roteiro6, t: number) =>
  rampa(t, r.etapas.empurre + 1.5, r.etapas.puxe + 1.5) *
  (1 - rampa(t, r.SUST_FIM + 0.8, r.SUST_FIM + 3.5));

const criarPassos = (r: Roteiro6): Passo[] => {
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
      titulo: "Quadril esquerdo",
      sub: "Aperte e leve para baixo e para trás",
    },
    {
      inicio: e.costas,
      fim: e.torax,
      kicker: "PASSO 3 DE 5",
      titulo: "Cotovelos à frente",
      sub: "Mantém a curva natural do alto das costas",
    },
    {
      inicio: e.torax,
      fim: e.respiracao,
      kicker: "PASSO 4 DE 5",
      titulo: "Tórax para a direita",
      sub: "Expanda o lado direito e gire um pouco para a direita",
    },
    {
      inicio: e.respiracao,
      fim: e.fique,
      kicker: "PASSO 5 DE 5",
      titulo: "Respiração",
      sub: "Encha o lado direito e feche o lado esquerdo",
    },
  ];
};

const so = (d: DestaquesFoto, chaves: (keyof DestaquesFoto)[]) =>
  Object.fromEntries(chaves.map((c) => [c, d[c]])) as DestaquesFoto;

const Conteudo: React.FC<{ r: Roteiro6 }> = ({ r }) => {
  const { A2, A3, AVISO_10, AVISO_30, SUST_FIM, etapas: e } = r;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  // Curva em S até "Vamos ajustar o quadril", intermediária até "Expanda o tórax", reta depois.
  const intermediaria = rampa(t, e.quadril, e.quadril + 1.5);
  const reta = rampa(t, e.expanda, e.expanda + 1.5);
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
        pastaDestaques="destaques6-curva-s"
        destaques={so(destaques, ["maos", "coluna", "quadril"])}
        crescimento={crescimento}
      />
      {intermediaria > 0 && reta < 1 ? (
        <AbsoluteFill style={{ opacity: intermediaria }}>
          <EsqueletoFoto
            pasta={pasta}
            imagem="costas-intermediaria.jpg"
            pastaDestaques="destaques6-intermediaria"
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
            pastaDestaques="destaques6-reta"
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
      {/* Quadril esquerdo para baixo (e para trás). */}
      <SetaBaixo x={870} y={560} inicio={e.aperte + 1.2} fim={e.costas} />
      <SetaGiro
        cy={330}
        rx={200}
        ry={50}
        paraDireita
        inicio={e.gire}
        fim={e.ombros + 1}
      />
      {/* Respiração: o lado direito abre (azul), o esquerdo fecha (âmbar, para dentro). */}
      <SetaLadoCorrecao
        espelhado={false}
        y={470}
        x0={1075}
        cor={cores.azul}
        inicio={e.encha + 0.5}
        fim={e.alinhados}
      />
      <SetaLadoCorrecao
        espelhado={false}
        y={470}
        x0={710}
        cor={cores.destaque}
        inicio={e.encha + 2.5}
        fim={e.alinhados}
      />
      <Cronometro />
      <Encerramento />
      <LinhasChao />
      <ChamadaLado
        espelhado={false}
        texto="Empurre as mãos nas coxas"
        alvo={{ x: 1113, y: 590 }}
        ancora={{ x: 1250, y: 540 }}
        inicio={e.empurre + 0.4}
        fim={e.puxe}
      />
      {/* Quadril esquerdo: etiqueta à esquerda, abaixo do texto do passo. */}
      <Chamada
        texto="Para baixo e para trás"
        alvo={{ x: 892, y: 630 }}
        ancora={{ x: 720, y: 830 }}
        inicio={e.aperte + 0.3}
        fim={e.lombar + 0.2}
      />
      <ChamadaLado
        espelhado={false}
        texto="Curvatura natural da lombar"
        alvo={{ x: 956, y: 570 }}
        ancora={{ x: 1250, y: 470 }}
        inicio={e.lombar + 0.3}
        fim={e.costas}
      />
      <ChamadaLado
        espelhado={false}
        texto="Cotovelos um pouco à frente"
        alvo={{ x: 1121, y: 500 }}
        ancora={{ x: 1260, y: 420 }}
        inicio={e.cotovelos + 0.5}
        fim={e.torax}
      />
      <ChamadaLado
        espelhado={false}
        texto="Expanda este lado"
        alvo={{ x: 1015, y: 460 }}
        ancora={{ x: 1230, y: 560 }}
        inicio={e.expanda + 0.6}
        fim={e.gire}
      />
      <ChamadaLado
        espelhado={false}
        texto="Ombros e cabeça alinhados"
        alvo={{ x: 1041, y: 349 }}
        ancora={{ x: 1210, y: 230 }}
        inicio={e.ombros + 0.5}
        fim={e.respiracao}
      />
      <ChamadaLado
        espelhado={false}
        texto="Encha este lado"
        alvo={{ x: 1015, y: 470 }}
        ancora={{ x: 1250, y: 600 }}
        inicio={e.encha + 0.5}
        fim={e.alinhados}
      />
      {/* Lado esquerdo fecha: etiqueta à esquerda, acima do texto do passo. */}
      <Chamada
        texto="Feche este lado"
        alvo={{ x: 905, y: 460 }}
        ancora={{ x: 760, y: 250 }}
        inicio={e.encha + 2.5}
        fim={e.alinhados}
      />
      <ChamadaLado
        espelhado={false}
        texto="Ombros e cabeça alinhados"
        alvo={{ x: 1041, y: 349 }}
        ancora={{ x: 1210, y: 230 }}
        inicio={e.alinhados + 0.5}
        fim={e.fique}
      />
      <Logo left={120} top={110} largura={440} inicio={r.A1} fim={A2 - 0.1} />
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

export const Exercicio6: React.FC = () => {
  const roteiro = useMemo(() => criarRoteiro6(), []);
  return (
    <RoteiroContexto.Provider value={roteiro}>
      <Conteudo r={roteiro} />
    </RoteiroContexto.Provider>
  );
};

// Seta para baixo ao lado do quadril: "leve o quadril para baixo".
const SetaBaixo: React.FC<{
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
  const desce = interpolate(t, [inicio, inicio + 1], [0, 1], {
    ...clamp,
    easing: suave,
  });
  const comprimento = 110 * desce;
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
        y2={y + comprimento}
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <path
        d={`M ${x - 24} ${y + comprimento - 28} L ${x} ${y + comprimento} L ${x + 24} ${y + comprimento - 28}`}
        fill="none"
        stroke={cores.destaque}
        strokeWidth={10}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
