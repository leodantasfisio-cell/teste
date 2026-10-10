import { cores } from "./cores";

// Esqueleto esquemático visto de costas, sentado num banco.
// O lado esquerdo do esqueleto fica no lado esquerdo da tela.
// viewBox 600 × 900; o centro da coluna está em x = 300.

export type Pose = {
  /** px que o tronco sobe (crescimento axial) */
  crescimento: number;
  /** px de deslocamento lateral do tronco (negativo = para a esquerda) */
  deslocamento: number;
  /** 0–1: rotação do tronco para a esquerda */
  rotacao: number;
  /** 0–1: cotovelos levados à frente */
  cotovelos: number;
  /** 0–1: expansão das costelas esquerdas */
  expansaoEsquerda: number;
  /** 0–1: respiração (expansão das duas costelas) */
  respiracao: number;
};

export type Destaques = {
  coluna?: number;
  maos?: number;
  pes?: number;
  costelasEsquerda?: number;
  escapulas?: number;
};

export const poseInicial: Pose = {
  crescimento: 0,
  deslocamento: 0,
  rotacao: 0,
  cotovelos: 0,
  expansaoEsquerda: 0,
  respiracao: 0,
};

const LARGURA_COSTELAS = [70, 96, 113, 123, 129, 131, 129, 123, 112, 98];

const vertebras = [
  ...Array.from({ length: 7 }, (_, i) => ({ y: 168 + i * 10, h: 8, w: 22 })),
  ...Array.from({ length: 12 }, (_, i) => ({
    y: 240 + i * 19,
    h: 15,
    w: 26 + i,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    y: 470 + i * 22,
    h: 18,
    w: 40 + i * 2,
  })),
];

const caminhoCostela = (i: number, lado: -1 | 1, abertura: number) => {
  const y = 256 + i * 20;
  const w = LARGURA_COSTELAS[i] * (1 + abertura * 0.09);
  const queda = 40 + i * 3;
  return `M ${300 + lado * 9} ${y} C ${300 + lado * w * 0.6} ${y - 14}, ${300 + lado * (w + 10)} ${y + 8}, ${300 + lado * w} ${y + queda}`;
};

const Costelas: React.FC<{ lado: -1 | 1; abertura: number; cor: string }> = ({
  lado,
  abertura,
  cor,
}) => (
  <g stroke={cor} fill="none" strokeWidth={7} strokeLinecap="round">
    {LARGURA_COSTELAS.map((_, i) => (
      <path key={i} d={caminhoCostela(i, lado, abertura)} />
    ))}
  </g>
);

const Vertebras: React.FC<{ cor: string; contorno?: string }> = ({
  cor,
  contorno,
}) => (
  <g fill={cor} stroke={contorno} strokeWidth={contorno ? 1.5 : 0}>
    {vertebras.map((v, i) => (
      <rect key={i} x={300 - v.w / 2} y={v.y} width={v.w} height={v.h} rx={4} />
    ))}
  </g>
);

const Escapulas: React.FC<{ cor: string; contorno?: string }> = ({
  cor,
  contorno,
}) => (
  <g fill={cor} stroke={contorno} strokeWidth={2} strokeLinejoin="round">
    <path d="M 262 250 L 176 244 L 218 372 Z" />
    <path d="M 338 250 L 424 244 L 382 372 Z" />
  </g>
);

export const Esqueleto: React.FC<{
  pose: Pose;
  destaques?: Destaques;
  style?: React.CSSProperties;
}> = ({ pose, destaques = {}, style }) => {
  const {
    crescimento,
    deslocamento,
    rotacao,
    cotovelos,
    expansaoEsquerda,
    respiracao,
  } = pose;
  const escalaX = 1 - rotacao * 0.12;
  const inclinacao = Math.tan((-rotacao * 3 * Math.PI) / 180);

  // Ponto do tronco (coordenadas do desenho) → posição na tela, com giro e deslocamento.
  const noTronco = (x: number, y: number) => {
    const xg = 300 + (x - 300) * escalaX;
    const yg = y + (x - 300) * escalaX * inclinacao;
    return { x: xg + deslocamento, y: yg - crescimento };
  };

  // Braços ficam fora do tronco: o ombro acompanha o tronco, a mão fica parada na coxa.
  const braco = (lado: -1 | 1) => {
    const ombro = noTronco(300 + lado * 128, 252);
    const mao = { x: 300 + lado * 117, y: 582 };
    const cotovelo = {
      x: (ombro.x + mao.x) / 2 + lado * (62 + cotovelos * 10),
      y: 432 - crescimento * 0.5 - cotovelos * 34,
    };
    return { ombro, cotovelo, mao };
  };
  const bracos = [braco(-1), braco(1)];

  const giro = `translate(${deslocamento} ${-crescimento}) translate(300 0) matrix(${escalaX} ${escalaX * inclinacao} 0 1 0 0) translate(-300 0)`;
  const brilho = "url(#brilho)";

  return (
    <svg viewBox="0 0 600 900" style={style}>
      <defs>
        <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Banco */}
      <rect x={110} y={688} width={380} height={24} rx={6} fill={cores.banco} />
      <rect x={140} y={712} width={16} height={170} fill={cores.bancoEscuro} />
      <rect x={444} y={712} width={16} height={170} fill={cores.bancoEscuro} />

      {/* Pernas abaixo do banco */}
      <g stroke={cores.ossoContorno} strokeWidth={2} fill={cores.osso}>
        <rect x={188} y={716} width={16} height={150} rx={7} />
        <rect x={206} y={720} width={6} height={140} rx={3} />
        <ellipse cx={198} cy={878} rx={26} ry={10} />
        <rect x={396} y={716} width={16} height={150} rx={7} />
        <rect x={388} y={720} width={6} height={140} rx={3} />
        <ellipse cx={402} cy={878} rx={26} ry={10} />
      </g>
      <g fill={cores.destaque} opacity={destaques.pes ?? 0} filter={brilho}>
        <ellipse cx={198} cy={878} rx={28} ry={11} />
        <ellipse cx={402} cy={878} rx={28} ry={11} />
      </g>

      {/* Pelve e fêmures */}
      <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={2}>
        <path d="M 294 572 C 240 556, 196 568, 192 610 C 190 650, 246 676, 290 668 Z" />
        <path d="M 306 572 C 360 556, 404 568, 408 610 C 410 650, 354 676, 310 668 Z" />
        <path d="M 274 580 L 326 580 L 300 668 Z" fill={cores.ossoSombra} />
        <rect x={196} y={640} width={26} height={52} rx={11} />
        <rect x={378} y={640} width={26} height={52} rx={11} />
      </g>
      <g fill={cores.destaque} opacity={destaques.maos ?? 0} filter={brilho}>
        <rect x={196} y={640} width={26} height={52} rx={11} />
        <rect x={378} y={640} width={26} height={52} rx={11} />
      </g>

      <g transform={giro}>
        <Escapulas cor={cores.ossoSombra} contorno={cores.ossoContorno} />
        <g opacity={destaques.escapulas ?? 0} filter={brilho}>
          <Escapulas cor={cores.destaque} />
        </g>

        <Costelas lado={1} abertura={respiracao} cor={cores.osso} />
        <Costelas
          lado={-1}
          abertura={respiracao + expansaoEsquerda}
          cor={cores.osso}
        />
        <g opacity={destaques.costelasEsquerda ?? 0} filter={brilho}>
          <Costelas
            lado={-1}
            abertura={respiracao + expansaoEsquerda}
            cor={cores.azul}
          />
        </g>

        <Vertebras cor={cores.osso} contorno={cores.ossoContorno} />
        <g opacity={destaques.coluna ?? 0} filter={brilho}>
          <Vertebras cor={cores.destaque} />
        </g>

        {/* Crânio (visto de trás) */}
        <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={2}>
          <ellipse cx={300} cy={96} rx={58} ry={68} />
          <path d="M 256 140 Q 300 162 344 140" fill="none" strokeWidth={3} />
        </g>
      </g>

      {/* Braços */}
      {[cores.osso, cores.destaque].map((cor, camada) => (
        <g
          key={cor}
          stroke={cor}
          fill={cor}
          strokeLinecap="round"
          opacity={camada === 0 ? 1 : (destaques.maos ?? 0)}
          filter={camada === 0 ? undefined : brilho}
        >
          {bracos.map(({ ombro, cotovelo, mao }, i) => (
            <g key={i}>
              {/* No destaque, só antebraço e mão */}
              {camada === 0 ? (
                <>
                  <line
                    x1={ombro.x}
                    y1={ombro.y}
                    x2={cotovelo.x}
                    y2={cotovelo.y}
                    strokeWidth={17}
                  />
                  <circle cx={ombro.x} cy={ombro.y} r={14} strokeWidth={0} />
                </>
              ) : null}
              <line
                x1={cotovelo.x}
                y1={cotovelo.y}
                x2={mao.x}
                y2={mao.y}
                strokeWidth={12}
              />
              <ellipse cx={mao.x} cy={mao.y} rx={15} ry={20} strokeWidth={0} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
};
