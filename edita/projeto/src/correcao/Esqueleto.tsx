import { cores } from "./cores";

// Esqueleto esquemático visto de costas, sentado num banco.
// O lado esquerdo do esqueleto fica no lado esquerdo da tela.
// viewBox 600 × 900; o centro da coluna está em x = 300.

type Props = {
  /** px que o tronco sobe (crescimento axial) */
  crescimento?: number;
  /** 0–1: brilho de destaque na coluna */
  destaqueColuna?: number;
  /** 0–1: costelas do lado esquerdo em azul */
  costelasEsquerda?: number;
  /** px de deslocamento lateral do tronco (negativo = para a esquerda) */
  deslocamento?: number;
  /** 0–1: rotação do tronco para a esquerda */
  rotacao?: number;
  /** 0–1: expansão das costelas (respiração) */
  respiracao?: number;
  style?: React.CSSProperties;
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

const Costela: React.FC<{ i: number; lado: -1 | 1; abertura: number }> = ({
  i,
  lado,
  abertura,
}) => {
  const y = 256 + i * 20;
  const w = LARGURA_COSTELAS[i] * (1 + abertura * 0.08);
  const queda = 40 + i * 3;
  const x0 = 300 + lado * 9;
  return (
    <path
      d={`M ${x0} ${y} C ${300 + lado * w * 0.6} ${y - 14}, ${300 + lado * (w + 10)} ${y + 8}, ${300 + lado * w} ${y + queda}`}
      fill="none"
      strokeWidth={7}
      strokeLinecap="round"
    />
  );
};

export const Esqueleto: React.FC<Props> = ({
  crescimento = 0,
  destaqueColuna = 0,
  costelasEsquerda = 0,
  deslocamento = 0,
  rotacao = 0,
  respiracao = 0,
  style,
}) => {
  const tronco = `translate(${deslocamento} ${-crescimento})`;
  // Rotação sugerida por compressão horizontal e leve inclinação da caixa torácica.
  const giro = `translate(300 400) scale(${1 - rotacao * 0.12} 1) skewY(${-rotacao * 3}) translate(-300 -400)`;

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

      {/* Pelve e fêmures */}
      <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={2}>
        <path d="M 294 572 C 240 556, 196 568, 192 610 C 190 650, 246 676, 290 668 Z" />
        <path d="M 306 572 C 360 556, 404 568, 408 610 C 410 650, 354 676, 310 668 Z" />
        <path d="M 274 580 L 326 580 L 300 668 Z" fill={cores.ossoSombra} />
        <rect x={196} y={640} width={26} height={52} rx={11} />
        <rect x={378} y={640} width={26} height={52} rx={11} />
      </g>

      <g transform={tronco}>
        <g transform={giro}>
          {/* Escápulas */}
          <g
            fill={cores.ossoSombra}
            stroke={cores.ossoContorno}
            strokeWidth={2}
            strokeLinejoin="round"
          >
            <path d="M 262 250 L 176 244 L 218 372 Z" />
            <path d="M 338 250 L 424 244 L 382 372 Z" />
          </g>

          {/* Costelas */}
          <g stroke={cores.osso}>
            {LARGURA_COSTELAS.map((_, i) => (
              <Costela key={`d${i}`} i={i} lado={1} abertura={respiracao} />
            ))}
          </g>
          <g stroke={cores.osso}>
            {LARGURA_COSTELAS.map((_, i) => (
              <Costela
                key={`e${i}`}
                i={i}
                lado={-1}
                abertura={respiracao + costelasEsquerda}
              />
            ))}
          </g>
          <g
            stroke={cores.azul}
            opacity={costelasEsquerda}
            filter="url(#brilho)"
          >
            {LARGURA_COSTELAS.map((_, i) => (
              <Costela
                key={`a${i}`}
                i={i}
                lado={-1}
                abertura={respiracao + costelasEsquerda}
              />
            ))}
          </g>

          {/* Coluna */}
          <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={1.5}>
            {vertebras.map((v, i) => (
              <rect
                key={i}
                x={300 - v.w / 2}
                y={v.y}
                width={v.w}
                height={v.h}
                rx={4}
              />
            ))}
          </g>
          <g
            fill={cores.destaque}
            opacity={destaqueColuna}
            filter="url(#brilho)"
          >
            {vertebras.map((v, i) => (
              <rect
                key={i}
                x={300 - v.w / 2}
                y={v.y}
                width={v.w}
                height={v.h}
                rx={4}
              />
            ))}
          </g>

          {/* Braços: úmero e antebraço indo até as coxas */}
          <g stroke={cores.osso} strokeLinecap="round">
            <line x1={172} y1={252} x2={150} y2={432} strokeWidth={17} />
            <line x1={150} y1={432} x2={178} y2={566} strokeWidth={12} />
            <line x1={428} y1={252} x2={450} y2={432} strokeWidth={17} />
            <line x1={450} y1={432} x2={422} y2={566} strokeWidth={12} />
          </g>
          <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={2}>
            <ellipse cx={183} cy={582} rx={15} ry={20} />
            <ellipse cx={417} cy={582} rx={15} ry={20} />
            <circle cx={172} cy={250} r={14} />
            <circle cx={428} cy={250} r={14} />
          </g>

          {/* Crânio (visto de trás) */}
          <g fill={cores.osso} stroke={cores.ossoContorno} strokeWidth={2}>
            <ellipse cx={300} cy={96} rx={58} ry={68} />
            <path d="M 256 140 Q 300 162 344 140" fill="none" strokeWidth={3} />
          </g>
        </g>
      </g>
    </svg>
  );
};
