import { Img, staticFile } from "remotion";

// Esqueleto 3D (imagens do Gemini, 2000 × 1116) com camadas de destaque por cima.
// As camadas são geradas por scripts/destaques.py e só pintam os ossos.

export const FOTO = {
  largura: 2000,
  altura: 1116,
  escala: 0.85,
  left: 110,
  top: 60,
};

/** Ponto da imagem original → posição na tela 1920 × 1080. */
export const naFoto = (x: number, y: number) => ({
  x: FOTO.left + x * FOTO.escala,
  y: FOTO.top + y * FOTO.escala,
});

export type DestaquesFoto = {
  coluna?: number;
  maos?: number;
  pes?: number;
  costelasEsquerda?: number;
  escapulas?: number;
};

const camadas: { chave: keyof DestaquesFoto; arquivo: string }[] = [
  { chave: "coluna", arquivo: "coluna" },
  { chave: "maos", arquivo: "maos" },
  { chave: "pes", arquivo: "pes" },
  { chave: "costelasEsquerda", arquivo: "costelas-esquerda" },
  { chave: "escapulas", arquivo: "escapulas" },
];

const preencher: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
};

export const EsqueletoFoto: React.FC<{
  imagem: string;
  destaques?: DestaquesFoto;
  /** 0–1: alongamento sutil do tronco (crescimento axial) */
  crescimento?: number;
}> = ({ imagem, destaques = {}, crescimento = 0 }) => {
  // Alonga a partir do assento do banco (y = 730 na imagem).
  const origemY = 730 * FOTO.escala;
  return (
    <div
      style={{
        position: "absolute",
        left: FOTO.left,
        top: FOTO.top,
        width: FOTO.largura * FOTO.escala,
        height: FOTO.altura * FOTO.escala,
        transformOrigin: `50% ${origemY}px`,
        scale: `1 ${1 + crescimento * 0.014}`,
        // Bordas suaves para a imagem se fundir ao fundo.
        maskImage:
          "radial-gradient(ellipse 48% 60% at 50% 50%, black 80%, transparent 100%)",
      }}
    >
      <Img src={staticFile(`esqueleto/${imagem}`)} style={preencher} />
      {camadas.map(({ chave, arquivo }) => {
        const opacidade = destaques[chave] ?? 0;
        return opacidade > 0 ? (
          <Img
            key={chave}
            src={staticFile(`esqueleto/destaques/${arquivo}.png`)}
            style={{ ...preencher, opacity: opacidade }}
          />
        ) : null;
      })}
    </div>
  );
};
